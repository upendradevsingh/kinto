import { prisma } from '@/lib/db'

const MAX_PROJECTS = 5
const MAX_MESSAGES_PER_DAY = 50

export async function checkProjectLimit(userId: string): Promise<{ allowed: boolean; count: number }> {
  const count = await prisma.project.count({
    where: { userId },
  })
  return { allowed: count < MAX_PROJECTS, count }
}

export async function checkMessageLimit(userId: string): Promise<{ allowed: boolean; count: number }> {
  const startOfDay = new Date()
  startOfDay.setHours(0, 0, 0, 0)

  const count = await prisma.message.count({
    where: {
      role: 'USER',
      createdAt: { gte: startOfDay },
      project: { userId },
    },
  })
  return { allowed: count < MAX_MESSAGES_PER_DAY, count }
}
