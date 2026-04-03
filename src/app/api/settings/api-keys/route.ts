import { NextRequest } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/auth'
import { prisma } from '@/lib/db'
import { encrypt } from '@/lib/encryption'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const apiKey = await prisma.apiKey.findUnique({
    where: { userId: session.user.id },
    select: { id: true, provider: true, lastFour: true, createdAt: true },
  })

  return new Response(JSON.stringify({ apiKey }), {
    headers: { 'Content-Type': 'application/json' },
  })
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  let key: string
  let provider: string = 'openai'
  try {
    const body = await req.json() as { key?: string; provider?: string }
    key = body.key ?? ''
    provider = body.provider ?? 'openai'
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid request body' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  if (!key || typeof key !== 'string' || key.trim().length < 10) {
    return new Response(JSON.stringify({ error: 'Invalid API key' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const ALLOWED_PROVIDERS = ['openai']
  if (!ALLOWED_PROVIDERS.includes(provider)) {
    return new Response(JSON.stringify({ error: 'Invalid provider' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const trimmed = key.trim()
  const lastFour = trimmed.slice(-4)
  const encrypted = encrypt(trimmed)

  const apiKey = await prisma.apiKey.upsert({
    where: { userId: session.user.id },
    create: {
      userId: session.user.id,
      provider,
      lastFour,
      ...encrypted,
    },
    update: {
      provider,
      lastFour,
      ...encrypted,
    },
    select: { id: true, provider: true, lastFour: true, createdAt: true },
  })

  return new Response(JSON.stringify({ apiKey }), {
    status: 201,
    headers: { 'Content-Type': 'application/json' },
  })
}
