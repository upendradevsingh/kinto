'use client'

import { signOut } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { LogOut } from 'lucide-react'

export function SignOutButton() {
  return (
    <Button
      size="sm"
      variant="ghost"
      onClick={() => signOut({ callbackUrl: '/' })}
      className="gap-2 text-muted-foreground hover:text-foreground"
    >
      <LogOut className="h-3.5 w-3.5" />
      <span className="hidden sm:inline">Sign out</span>
    </Button>
  )
}
