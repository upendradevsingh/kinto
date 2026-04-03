import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

interface RouteParams {
  params: { projectId: string }
}

export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    const project = await prisma.project.findUnique({
      where: { id: params.projectId },
      include: {
        messages: {
          orderBy: { createdAt: 'asc' },
          where: { role: { not: 'SYSTEM' } },
        },
      },
    })
    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    }
    return NextResponse.json(project)
  } catch (error) {
    console.error('GET /api/projects/[id] error:', error)
    return NextResponse.json({ error: 'Failed to fetch project' }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest, { params }: RouteParams) {
  try {
    const data = await req.json() as Record<string, unknown>
    const project = await prisma.project.update({
      where: { id: params.projectId },
      data,
    })
    return NextResponse.json(project)
  } catch (error) {
    console.error('PATCH /api/projects/[id] error:', error)
    return NextResponse.json({ error: 'Failed to update project' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest, { params }: RouteParams) {
  try {
    await prisma.project.delete({ where: { id: params.projectId } })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('DELETE /api/projects/[id] error:', error)
    return NextResponse.json({ error: 'Failed to delete project' }, { status: 500 })
  }
}
