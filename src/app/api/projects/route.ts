import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET() {
  try {
    const projects = await prisma.project.findMany({
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
  try {
    const body = await req.json() as { name?: string; description?: string }
    const project = await prisma.project.create({
      data: {
        name: body.name ?? 'New App',
        description: body.description,
        phase: 'DISCOVERY',
      },
    })
    return NextResponse.json(project)
  } catch (error) {
    console.error('POST /api/projects error:', error)
    return NextResponse.json({ error: 'Failed to create project' }, { status: 500 })
  }
}
