import { getServerSession } from 'next-auth'
import { authOptions } from '@/auth'
import { prisma } from '@/lib/db'
import { redirect } from 'next/navigation'
import { ApiKeyManager } from '@/components/settings/ApiKeyManager'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowLeft, KeyRound } from 'lucide-react'

export default async function ApiKeysPage() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) redirect('/auth/signin')

  const apiKey = await prisma.apiKey.findUnique({
    where: { userId: session.user.id },
    select: { id: true, provider: true, lastFour: true, createdAt: true },
  })

  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-2xl mx-auto px-4 py-12">
        <div className="flex items-center gap-3 mb-8">
          <Link href="/">
            <Button variant="ghost" size="icon" className="h-7 w-7">
              <ArrowLeft className="h-3.5 w-3.5" />
            </Button>
          </Link>
          <div className="flex items-center gap-2">
            <KeyRound className="h-5 w-5 text-primary" />
            <h1 className="text-xl font-bold">API Keys</h1>
          </div>
        </div>

        <ApiKeyManager
          initialApiKey={
            apiKey
              ? { ...apiKey, createdAt: apiKey.createdAt.toISOString() }
              : null
          }
        />
      </div>
    </div>
  )
}
