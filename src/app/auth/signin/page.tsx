import { getServerSession } from 'next-auth'
import { authOptions } from '@/auth'
import { redirect } from 'next/navigation'
import { SignInButtons } from '@/components/auth/SignInButtons'
import { Zap } from 'lucide-react'

export default async function SignInPage({
  searchParams,
}: {
  searchParams: { callbackUrl?: string; error?: string }
}) {
  const session = await getServerSession(authOptions)
  const callbackUrl = searchParams.callbackUrl?.startsWith('/') ? searchParams.callbackUrl : '/'
  if (session) redirect(callbackUrl)

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-sm space-y-8">
        <div className="text-center space-y-2">
          <div className="flex justify-center">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary">
              <Zap className="h-5 w-5 text-primary-foreground" />
            </div>
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Sign in to Kinto</h1>
          <p className="text-sm text-muted-foreground">
            Describe it. It exists.
          </p>
        </div>

        {searchParams.error && (
          <div className="rounded-lg border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            {searchParams.error === 'OAuthAccountNotLinked'
              ? 'This email is already linked to another provider.'
              : 'Something went wrong. Please try again.'}
          </div>
        )}

        <SignInButtons callbackUrl={callbackUrl} />
      </div>
    </div>
  )
}
