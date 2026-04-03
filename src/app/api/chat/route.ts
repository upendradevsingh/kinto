import { NextRequest } from 'next/server'
import { openai } from '@/lib/openai'
import { prisma } from '@/lib/db'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/auth'
import { checkMessageLimit } from '@/lib/rate-limit'
import { getSystemPromptForPhase, detectPhaseTransition } from '@/lib/conversation/state-machine'
import {
  extractRequirementsFromMessage,
  extractArchitectureFromMessage,
  extractGeneratedFiles,
  extractPreviewHtml,
} from '@/lib/conversation/requirements-builder'
import { ProjectPhase, MessageRole } from '@prisma/client'

export const maxDuration = 60

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    const { projectId, message, phase } = await req.json() as {
      projectId: string
      message: string
      phase: string
    }

    if (!projectId || !message) {
      return new Response(JSON.stringify({ error: 'projectId and message required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    const isGreeting = message === '__GREETING__'

    if (!isGreeting) {
      const { allowed, count } = await checkMessageLimit(session.user.id)
      if (!allowed) {
        return new Response(
          JSON.stringify({ error: `Daily message limit reached (${count}/50). Try again tomorrow.` }),
          { status: 429, headers: { 'Content-Type': 'application/json' } }
        )
      }
    }

    // Verify project belongs to authenticated user
    const project = await prisma.project.findFirst({
      where: { id: projectId, userId: session.user.id },
    })
    if (!project) {
      return new Response(JSON.stringify({ error: 'Project not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    // Save user message (skip for greeting)
    if (!isGreeting) {
      await prisma.message.create({
        data: {
          projectId,
          role: MessageRole.USER,
          content: message,
        },
      })
    }

    // Get conversation history
    const history = await prisma.message.findMany({
      where: { projectId },
      orderBy: { createdAt: 'asc' },
      take: 30,
    })

    const currentPhase = phase || 'GREETING'
    const systemPrompt = getSystemPromptForPhase(currentPhase as import('@/lib/conversation/questions').ConversationPhase)

    // Build messages for OpenAI
    const openaiMessages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }> = [
      { role: 'system', content: systemPrompt },
    ]

    if (isGreeting) {
      // For greeting, just ask AI to start the conversation
      openaiMessages.push({
        role: 'user',
        content: 'Please start the conversation with your opening greeting.',
      })
    } else {
      // Include full history
      for (const m of history) {
        if (m.role === MessageRole.USER || m.role === MessageRole.ASSISTANT) {
          openaiMessages.push({
            role: m.role.toLowerCase() as 'user' | 'assistant',
            content: m.content,
          })
        }
      }
    }

    const encoder = new TextEncoder()
    let fullResponse = ''

    const stream = new ReadableStream({
      async start(controller) {
        try {
          const openaiStream = await openai.chat.completions.create({
            model: 'gpt-4o',
            messages: openaiMessages,
            stream: true,
            temperature: 0.7,
            max_tokens: 4000,
          })

          for await (const chunk of openaiStream) {
            const delta = chunk.choices[0]?.delta?.content ?? ''
            if (delta) {
              fullResponse += delta
              controller.enqueue(
                encoder.encode(`data: ${JSON.stringify({ delta })}\n\n`)
              )
            }
          }

          // Save assistant message
          const assistantMessage = await prisma.message.create({
            data: {
              projectId,
              role: MessageRole.ASSISTANT,
              content: fullResponse,
            },
          })

          // Extract structured data
          const requirements = extractRequirementsFromMessage(fullResponse)
          const architecture = extractArchitectureFromMessage(fullResponse)
          const generatedFiles = extractGeneratedFiles(fullResponse)
          const previewHtml = extractPreviewHtml(fullResponse)

          // Update project with extracted data
          const updateData: Record<string, unknown> = { updatedAt: new Date() }

          if (requirements) {
            updateData.requirements = requirements
            updateData.phase = ProjectPhase.ARCHITECTURE
            // Update project name if we have it
            if ((requirements as { projectName?: string }).projectName) {
              updateData.name = (requirements as { projectName?: string }).projectName
            }
          }

          if (architecture) {
            updateData.architecture = architecture
          }

          if (Object.keys(generatedFiles).length > 0) {
            const project = await prisma.project.findUnique({ where: { id: projectId } })
            const existingFiles = (project?.generatedFiles ?? {}) as Record<string, string>
            updateData.generatedFiles = { ...existingFiles, ...generatedFiles }
            updateData.phase = ProjectPhase.GENERATION
          }

          if (previewHtml) {
            updateData.previewHtml = previewHtml
          }

          await prisma.project.update({
            where: { id: projectId },
            data: updateData,
          })

          // Detect phase transition for next message
          const newPhase = detectPhaseTransition(
            currentPhase as import('@/lib/conversation/questions').ConversationPhase,
            fullResponse,
            isGreeting ? '' : message
          )

          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({
                done: true,
                messageId: assistantMessage.id,
                requirements: requirements ?? null,
                architecture: architecture ?? null,
                generatedFileKeys: Object.keys(generatedFiles).length > 0 ? Object.keys(generatedFiles) : null,
                previewHtml: previewHtml ?? null,
                newPhase,
              })}\n\n`
            )
          )
        } catch (error) {
          console.error('Chat stream error:', error)
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({ error: 'Failed to generate response' })}\n\n`
            )
          )
        } finally {
          controller.close()
        }
      },
    })

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
      },
    })
  } catch (error) {
    console.error('Chat route error:', error)
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}
