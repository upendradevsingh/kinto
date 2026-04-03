import { prisma } from '@/lib/db'
import { redirect } from 'next/navigation'

export default async function NewBuilderPage() {
  const project = await prisma.project.create({
    data: {
      name: 'New App',
      phase: 'DISCOVERY',
    },
  })
  redirect(`/builder/${project.id}`)
}
