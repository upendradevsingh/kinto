'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { GitBranch, Mail, Globe } from 'lucide-react'

interface SignInButtonsProps {
  callbackUrl: string
}

export function SignInButtons({ callbackUrl }: SignInButtonsProps) {
  const [email, setEmail] = useState('')
  const [emailSent, setEmailSent] = useState(false)
  const [loading, setLoading] = useState<string | null>(null)

  const handleOAuth = async (provider: string) => {
    setLoading(provider)
    await signIn(provider, { callbackUrl })
  }

  const handleEmail = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return
    setLoading('email')
    const res = await signIn('email', { email, callbackUrl, redirect: false })
    setLoading(null)
    if (res?.ok) setEmailSent(true)
  }

  if (emailSent) {
    return (
      <div className="rounded-lg border bg-muted/50 px-6 py-8 text-center space-y-2">
        <Mail className="h-8 w-8 mx-auto text-primary" />
        <p className="font-medium">Check your email</p>
        <p className="text-sm text-muted-foreground">
          We sent a sign-in link to <strong>{email}</strong>
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Button
          className="w-full gap-2"
          variant="outline"
          onClick={() => handleOAuth('google')}
          disabled={loading !== null}
        >
          <Globe className="h-4 w-4" />
          Continue with Google
        </Button>
        <Button
          className="w-full gap-2"
          variant="outline"
          onClick={() => handleOAuth('github')}
          disabled={loading !== null}
        >
          <GitBranch className="h-4 w-4" />
          Continue with GitHub
        </Button>
      </div>

      <div className="flex items-center gap-3">
        <Separator className="flex-1" />
        <span className="text-xs text-muted-foreground">or</span>
        <Separator className="flex-1" />
      </div>

      <form onSubmit={handleEmail} className="space-y-2">
        <Input
          type="email"
          placeholder="you@example.com"
          value={email}
          onChange={e => setEmail(e.target.value)}
          disabled={loading !== null}
          required
        />
        <Button
          type="submit"
          className="w-full gap-2"
          disabled={loading !== null || !email}
        >
          <Mail className="h-4 w-4" />
          {loading === 'email' ? 'Sending...' : 'Continue with Email'}
        </Button>
      </form>

      <p className="text-center text-xs text-muted-foreground">
        By signing in, you agree to our terms of service.
      </p>
    </div>
  )
}
