import { prisma } from '@/lib/db'
import { notFound, redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/auth'
import { BuilderLayout } from '@/components/layout/BuilderLayout'

interface BuilderPageProps {
  params: { projectId: string }
}

export default async function BuilderPage({ params }: BuilderPageProps) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) redirect('/auth/signin')

  const project = await prisma.project.findFirst({
    where: { id: params.projectId, userId: session.user.id },
    include: {
      messages: {
        where: { role: { not: 'SYSTEM' } },
        orderBy: { createdAt: 'asc' },
      },
    },
  })

  if (!project) notFound()

  const messages = project.messages.map(m => ({
    id: m.id,
    role: m.role.toLowerCase() as 'user' | 'assistant',
    content: m.content,
  }))

  return (
    <BuilderLayout
      projectId={project.id}
      projectName={project.name}
      initialMessages={messages}
      initialPhase={project.phase}
      initialPreviewHtml={project.previewHtml}
      initialFiles={(project.generatedFiles as Record<string, string>) ?? {}}
      user={session.user}
    />
  )
}
