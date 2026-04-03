import { NextRequest } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/auth'
import { prisma } from '@/lib/db'
import { decrypt } from '@/lib/encryption'
import OpenAI from 'openai'

export async function POST(_req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const record = await prisma.apiKey.findUnique({ where: { userId: session.user.id } })
  if (!record) {
    return new Response(JSON.stringify({ error: 'No API key saved' }), {
      status: 404,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  try {
    const plainKey = decrypt({
      encryptedKey: record.encryptedKey,
      iv: record.iv,
      tag: record.tag,
    })
    const client = new OpenAI({ apiKey: plainKey })
    // Minimal test: list models (very cheap, just validates the key)
    await client.models.list()
    return new Response(JSON.stringify({ ok: true }), {
      headers: { 'Content-Type': 'application/json' },
    })
  } catch {
    return new Response(JSON.stringify({ ok: false, error: 'API key is invalid or expired' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}
