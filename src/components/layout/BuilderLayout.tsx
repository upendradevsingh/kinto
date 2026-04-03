'use client'

import { useState, useCallback } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from '@/components/ui/resizable'
import { ChatPanel } from '@/components/chat/ChatPanel'
import { PreviewPanel } from '@/components/preview/PreviewPanel'
import { CodePanel } from '@/components/code/CodePanel'
import { ArrowLeft, Zap } from 'lucide-react'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
}

interface BuilderLayoutProps {
  projectId: string
  projectName: string
  initialMessages?: Message[]
  initialPhase?: string
  initialPreviewHtml?: string | null
  initialFiles?: Record<string, string>
}

export function BuilderLayout({
  projectId,
  projectName,
  initialMessages = [],
  initialPhase = 'GREETING',
  initialPreviewHtml = null,
  initialFiles = {},
}: BuilderLayoutProps) {
  const [previewHtml, setPreviewHtml] = useState<string | null>(initialPreviewHtml)
  const [files, setFiles] = useState<Record<string, string>>(initialFiles)
  const [phase, setPhase] = useState(initialPhase)
  const [name] = useState(projectName)

  const handlePreviewUpdate = useCallback((html: string) => {
    setPreviewHtml(html)
  }, [])

  const handleFilesUpdate = useCallback((newFiles: Record<string, string>) => {
    setFiles(newFiles)
  }, [])

  const handlePhaseChange = useCallback((newPhase: string) => {
    setPhase(newPhase)
  }, [])

  const phaseLabel = phase.toLowerCase().replace(/_/g, ' ')

  return (
    <div className="flex flex-col h-screen bg-background overflow-hidden">
      {/* Top navigation bar */}
      <header className="flex items-center gap-3 px-4 h-11 border-b bg-background/95 backdrop-blur shrink-0">
        <Link href="/">
          <Button variant="ghost" size="icon" className="h-7 w-7">
            <ArrowLeft className="h-3.5 w-3.5" />
          </Button>
        </Link>

        <div className="flex items-center gap-2 min-w-0">
          <Zap className="h-4 w-4 text-primary shrink-0" />
          <span className="text-sm font-semibold truncate max-w-[200px]">{name}</span>
        </div>

        <div className="ml-auto flex items-center gap-2">
          <span className="text-xs text-muted-foreground">
            Phase:
          </span>
          <span className="text-xs font-medium capitalize bg-muted px-2 py-0.5 rounded-full">
            {phaseLabel}
          </span>
        </div>
      </header>

      {/* Three-panel resizable layout */}
      <ResizablePanelGroup direction="horizontal" className="flex-1 min-h-0">
        {/* Left: Chat panel */}
        <ResizablePanel defaultSize={35} minSize={25} maxSize={50} id="chat">
          <div className="h-full overflow-hidden">
            <ChatPanel
              projectId={projectId}
              initialMessages={initialMessages}
              phase={initialPhase}
              onPreviewUpdate={handlePreviewUpdate}
              onFilesUpdate={handleFilesUpdate}
              onPhaseChange={handlePhaseChange}
            />
          </div>
        </ResizablePanel>

        <ResizableHandle withHandle />

        {/* Right: Preview (top) + Code (bottom) */}
        <ResizablePanel defaultSize={65} minSize={40} id="right">
          <ResizablePanelGroup direction="vertical" className="h-full">
            {/* Preview — top */}
            <ResizablePanel defaultSize={50} minSize={20} id="preview">
              <div className="h-full overflow-hidden">
                <PreviewPanel
                  previewHtml={previewHtml}
                  projectName={name}
                />
              </div>
            </ResizablePanel>

            <ResizableHandle withHandle />

            {/* Code editor — bottom */}
            <ResizablePanel defaultSize={50} minSize={20} id="code">
              <div className="h-full overflow-hidden">
                <CodePanel files={files} />
              </div>
            </ResizablePanel>
          </ResizablePanelGroup>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  )
}
