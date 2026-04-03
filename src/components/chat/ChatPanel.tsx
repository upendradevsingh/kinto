'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { ChatMessage } from './ChatMessage'
import { ChatInput } from './ChatInput'
import { cleanMessageForDisplay } from '@/lib/conversation/requirements-builder'
import { Sparkles } from 'lucide-react'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
}

interface ChatPanelProps {
  projectId: string
  initialMessages?: Message[]
  phase: string
  onPreviewUpdate?: (html: string) => void
  onFilesUpdate?: (files: Record<string, string>) => void
  onPhaseChange?: (phase: string) => void
}

export function ChatPanel({
  projectId,
  initialMessages = [],
  phase,
  onPreviewUpdate,
  onFilesUpdate,
  onPhaseChange,
}: ChatPanelProps) {
  const [messages, setMessages] = useState<Message[]>(initialMessages)
  const [streamingContent, setStreamingContent] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [currentPhase, setCurrentPhase] = useState(phase)
  const scrollRef = useRef<HTMLDivElement>(null)
  const hasGreeted = useRef(false)

  const scrollToBottom = useCallback(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages, streamingContent, scrollToBottom])

  const streamChat = useCallback(
    async (userMessage: string, isGreeting = false) => {
      if (isLoading) return
      setIsLoading(true)
      setStreamingContent('')

      try {
        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            projectId,
            message: isGreeting ? '__GREETING__' : userMessage,
            phase: currentPhase,
          }),
        })

        if (!response.ok || !response.body) {
          throw new Error(`Chat request failed: ${response.status}`)
        }

        const reader = response.body.getReader()
        const decoder = new TextDecoder()
        let accumulated = ''

        while (true) {
          const { done, value } = await reader.read()
          if (done) break

          const text = decoder.decode(value, { stream: true })
          const lines = text.split('\n')

          for (const line of lines) {
            if (!line.startsWith('data: ')) continue
            const raw = line.slice(6).trim()
            if (!raw) continue

            try {
              const data = JSON.parse(raw) as {
                delta?: string
                done?: boolean
                messageId?: string
                requirements?: Record<string, unknown> | null
                architecture?: Record<string, unknown> | null
                generatedFileKeys?: string[] | null
                previewHtml?: string | null
                newPhase?: string
                error?: string
              }

              if (data.error) {
                throw new Error(data.error)
              }

              if (data.delta) {
                accumulated += data.delta
                setStreamingContent(cleanMessageForDisplay(accumulated))
              }

              if (data.done) {
                const displayContent = cleanMessageForDisplay(accumulated)
                const assistantMsg: Message = {
                  id: data.messageId ?? Date.now().toString(),
                  role: 'assistant',
                  content: displayContent,
                }
                setMessages(prev => [...prev, assistantMsg])
                setStreamingContent('')

                // Handle phase transition
                if (data.newPhase && data.newPhase !== currentPhase) {
                  setCurrentPhase(data.newPhase)
                  onPhaseChange?.(data.newPhase)
                }

                // Update preview
                if (data.previewHtml && onPreviewUpdate) {
                  onPreviewUpdate(data.previewHtml)
                }

                // Update files
                if (data.generatedFileKeys && data.generatedFileKeys.length > 0 && onFilesUpdate) {
                  const projectRes = await fetch(`/api/projects/${projectId}`)
                  if (projectRes.ok) {
                    const project = await projectRes.json() as { generatedFiles?: Record<string, string> }
                    if (project.generatedFiles) {
                      onFilesUpdate(project.generatedFiles)
                    }
                  }
                }
              }
            } catch {
              // Incomplete JSON chunk — ignore
            }
          }
        }
      } catch (error) {
        console.error('Chat error:', error)
        setMessages(prev => [
          ...prev,
          {
            id: Date.now().toString(),
            role: 'assistant',
            content: "I ran into an issue. Please try again.",
          },
        ])
        setStreamingContent('')
      } finally {
        setIsLoading(false)
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [projectId, currentPhase, isLoading, onPreviewUpdate, onFilesUpdate, onPhaseChange]
  )

  // Auto-greeting on mount
  useEffect(() => {
    if (!hasGreeted.current && messages.length === 0) {
      hasGreeted.current = true
      streamChat('', true)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleSend = useCallback(
    (message: string) => {
      // Add user message to UI immediately
      setMessages(prev => [
        ...prev,
        { id: Date.now().toString(), role: 'user', content: message },
      ])
      streamChat(message)
    },
    [streamChat]
  )

  const phaseLabel = currentPhase.toLowerCase().replace(/_/g, ' ')

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header */}
      <div className="flex items-center gap-2 px-4 py-2.5 border-b bg-background shrink-0">
        <Sparkles className="h-4 w-4 text-primary" />
        <span className="text-sm font-semibold">Kinto AI</span>
        <span className="ml-auto text-xs text-muted-foreground capitalize bg-muted px-2 py-0.5 rounded-full">
          {phaseLabel}
        </span>
      </div>

      {/* Messages area */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-2">
        {messages.length === 0 && !isLoading && !streamingContent && (
          <div className="flex flex-col items-center justify-center h-full gap-3 text-center py-12">
            <Sparkles className="h-8 w-8 text-muted-foreground/30" />
            <p className="text-muted-foreground text-sm max-w-xs">
              Describe what you want to build and I&apos;ll help you create it.
            </p>
          </div>
        )}

        {messages.map(msg => (
          <ChatMessage key={msg.id} role={msg.role} content={msg.content} />
        ))}

        {streamingContent && (
          <ChatMessage role="assistant" content={streamingContent} isStreaming />
        )}

        {isLoading && !streamingContent && (
          <div className="flex gap-3 py-3">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
              <Sparkles className="h-4 w-4 animate-pulse" />
            </div>
            <div className="bg-muted rounded-lg px-3 py-2 text-sm text-muted-foreground">
              Thinking...
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="shrink-0">
        <ChatInput
          onSend={handleSend}
          disabled={isLoading}
          placeholder={
            currentPhase === 'GENERATION'
              ? 'Request changes or say "looks good"...'
              : currentPhase === 'ARCHITECTURE'
              ? 'Approve or request changes...'
              : 'Describe your app idea...'
          }
        />
      </div>
    </div>
  )
}
