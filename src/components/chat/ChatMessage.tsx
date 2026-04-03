'use client'

import { cn } from '@/lib/utils'
import { Bot, User } from 'lucide-react'
import ReactMarkdown from 'react-markdown'

interface ChatMessageProps {
  role: 'user' | 'assistant'
  content: string
  isStreaming?: boolean
}

export function ChatMessage({ role, content, isStreaming }: ChatMessageProps) {
  const isAI = role === 'assistant'

  return (
    <div className={cn('flex gap-3 py-3', isAI ? 'flex-row' : 'flex-row-reverse')}>
      <div
        className={cn(
          'flex h-7 w-7 shrink-0 select-none items-center justify-center rounded-full',
          isAI
            ? 'bg-primary text-primary-foreground'
            : 'bg-muted border'
        )}
      >
        {isAI ? (
          <Bot className="h-4 w-4" />
        ) : (
          <User className="h-4 w-4" />
        )}
      </div>
      <div
        className={cn(
          'flex max-w-[85%] flex-col rounded-lg px-3 py-2 text-sm',
          isAI
            ? 'bg-muted text-foreground'
            : 'bg-primary text-primary-foreground ml-auto'
        )}
      >
        {isAI ? (
          <div className="max-w-none break-words leading-relaxed [&_p]:mb-2 [&_ul]:mb-2 [&_ul]:ml-4 [&_ul]:list-disc [&_ol]:mb-2 [&_ol]:ml-4 [&_ol]:list-decimal [&_li]:mb-0.5 [&_code]:rounded [&_code]:bg-background/50 [&_code]:px-1 [&_code]:py-0.5 [&_code]:font-mono [&_code]:text-xs [&_pre]:overflow-x-auto [&_pre]:rounded [&_pre]:bg-background/50 [&_pre]:p-2 [&_pre]:text-xs [&_strong]:font-semibold [&_h1]:text-base [&_h1]:font-bold [&_h2]:text-sm [&_h2]:font-bold [&_h3]:text-sm [&_h3]:font-semibold">
            <ReactMarkdown>{content}</ReactMarkdown>
            {isStreaming && (
              <span className="inline-block w-1.5 h-4 bg-current ml-0.5 animate-pulse align-middle" />
            )}
          </div>
        ) : (
          <p className="whitespace-pre-wrap break-words">{content}</p>
        )}
      </div>
    </div>
  )
}
