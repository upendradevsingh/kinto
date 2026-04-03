import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/auth'
import { prisma } from '@/lib/db'
import { checkProjectLimit } from '@/lib/rate-limit'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const projects = await prisma.project.findMany({
      where: { userId: session.user.id },
      orderBy: { updatedAt: 'desc' },
      select: {
        id: true,
        name: true,
        description: true,
        phase: true,
        createdAt: true,
        updatedAt: true,
      },
    })
    return NextResponse.json(projects)
  } catch (error) {
    console.error('GET /api/projects error:', error)
    return NextResponse.json({ error: 'Failed to fetch projects' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { allowed, count } = await checkProjectLimit(session.user.id)
  if (!allowed) {
    return NextResponse.json(
      { error: `Project limit reached (${count}/5). Delete a project to create a new one.` },
      { status: 429 }
    )
  }

  try {
    const body = await req.json() as { name?: string; description?: string }
    const project = await prisma.project.create({
      data: {
        name: body.name ?? 'New App',
        description: body.description,
        phase: 'DISCOVERY',
        userId: session.user.id,
      },
    })
    return NextResponse.json(project)
  } catch (error) {
    console.error('POST /api/projects error:', error)
    return NextResponse.json({ error: 'Failed to create project' }, { status: 500 })
  }
}
