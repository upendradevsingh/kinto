'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { KeyRound, Trash2, CheckCircle, XCircle, Loader2 } from 'lucide-react'

interface ApiKey {
  id: string
  provider: string
  lastFour: string
  createdAt: string
}

interface ApiKeyManagerProps {
  initialApiKey: ApiKey | null
}

export function ApiKeyManager({ initialApiKey }: ApiKeyManagerProps) {
  const [apiKey, setApiKey] = useState<ApiKey | null>(initialApiKey)
  const [inputValue, setInputValue] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [isTesting, setIsTesting] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [testResult, setTestResult] = useState<'valid' | 'invalid' | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleSave = async () => {
    if (!inputValue.trim()) return
    setIsSaving(true)
    setError(null)
    setTestResult(null)
    try {
      const res = await fetch('/api/settings/api-keys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: inputValue }),
      })
      if (!res.ok) {
        const data = await res.json() as { error?: string }
        setError(data.error ?? 'Failed to save key')
        return
      }
      const data = await res.json() as { apiKey: ApiKey }
      setApiKey(data.apiKey)
      setInputValue('')
    } catch {
      setError('Failed to save key')
    } finally {
      setIsSaving(false)
    }
  }

  const handleTest = async () => {
    setIsTesting(true)
    setTestResult(null)
    setError(null)
    try {
      const res = await fetch('/api/settings/api-keys/test', { method: 'POST' })
      const data = await res.json() as { ok: boolean; error?: string }
      setTestResult(data.ok ? 'valid' : 'invalid')
      if (!data.ok && data.error) setError(data.error)
    } catch {
      setTestResult('invalid')
      setError('Connection error')
    } finally {
      setIsTesting(false)
    }
  }

  const handleDelete = async () => {
    if (!apiKey) return
    setIsDeleting(true)
    setError(null)
    setTestResult(null)
    try {
      const res = await fetch(`/api/settings/api-keys/${apiKey.id}`, { method: 'DELETE' })
      if (res.ok || res.status === 204) {
        setApiKey(null)
      } else {
        setError('Failed to delete key')
      }
    } catch {
      setError('Failed to delete key')
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <div className="space-y-4">
      {/* Current key display */}
      {apiKey ? (
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <KeyRound className="h-4 w-4 text-primary" />
                <CardTitle className="text-base">OpenAI API Key</CardTitle>
                <Badge variant="secondary" className="text-xs">Active</Badge>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDelete}
                disabled={isDeleting}
                className="text-destructive hover:text-destructive hover:bg-destructive/10"
              >
                {isDeleting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Trash2 className="h-4 w-4" />
                )}
              </Button>
            </div>
            <CardDescription>
              sk-...{apiKey.lastFour} · Saved {new Date(apiKey.createdAt).toLocaleDateString()}
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleTest}
                disabled={isTesting}
                className="gap-2"
              >
                {isTesting ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <KeyRound className="h-3.5 w-3.5" />
                )}
                Test key
              </Button>
              {testResult === 'valid' && (
                <span className="flex items-center gap-1 text-sm text-green-600">
                  <CheckCircle className="h-4 w-4" /> Valid
                </span>
              )}
              {testResult === 'invalid' && (
                <span className="flex items-center gap-1 text-sm text-destructive">
                  <XCircle className="h-4 w-4" /> Invalid
                </span>
              )}
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-8 gap-2 text-center">
            <KeyRound className="h-8 w-8 text-muted-foreground/40" />
            <p className="text-sm text-muted-foreground">No API key saved yet</p>
          </CardContent>
        </Card>
      )}

      {/* Add / replace key */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">{apiKey ? 'Replace key' : 'Add your OpenAI API key'}</CardTitle>
          <CardDescription>
            Your key is encrypted with AES-256-GCM and stored securely. We never log it.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex gap-2">
            <Input
              type="password"
              placeholder="sk-..."
              value={inputValue}
              onChange={e => setInputValue(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSave()}
              className="font-mono"
            />
            <Button onClick={handleSave} disabled={isSaving || !inputValue.trim()}>
              {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Save'}
            </Button>
          </div>
          {error && (
            <p className="text-sm text-destructive">{error}</p>
          )}
          <p className="text-xs text-muted-foreground">
            Get your API key from{' '}
            <a
              href="https://platform.openai.com/api-keys"
              target="_blank"
              rel="noopener noreferrer"
              className="underline underline-offset-2"
            >
              platform.openai.com/api-keys
            </a>
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
