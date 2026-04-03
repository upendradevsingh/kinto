import { prisma } from '@/lib/db'
import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/auth'
import { checkProjectLimit } from '@/lib/rate-limit'

export default async function NewBuilderPage() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) redirect('/auth/signin?callbackUrl=/builder')

  const { allowed } = await checkProjectLimit(session.user.id)
  if (!allowed) redirect('/?error=project_limit')

  const project = await prisma.project.create({
    data: {
      name: 'New App',
      phase: 'DISCOVERY',
      userId: session.user.id,
    },
  })
  redirect(`/builder/${project.id}`)
}
