'use client'

import { cn } from '@/lib/utils'
import { FileCode } from 'lucide-react'

interface FileTabsProps {
  files: string[]
  activeFile: string | null
  onSelect: (file: string) => void
}

export function FileTabs({ files, activeFile, onSelect }: FileTabsProps) {
  if (files.length === 0) return null

  return (
    <div className="flex overflow-x-auto border-b bg-muted/10 shrink-0 scrollbar-none">
      {files.map(file => {
        const filename = file.split('/').pop() ?? file
        const isActive = activeFile === file
        return (
          <button
            key={file}
            onClick={() => onSelect(file)}
            className={cn(
              'flex items-center gap-1.5 px-3 py-1.5 text-xs border-r shrink-0 transition-colors whitespace-nowrap',
              isActive
                ? 'bg-background text-foreground border-b-2 border-b-primary -mb-px'
                : 'text-muted-foreground hover:text-foreground hover:bg-background/60'
            )}
            title={file}
          >
            <FileCode className="h-3 w-3 shrink-0" />
            <span>{filename}</span>
          </button>
        )
      })}
    </div>
  )
}
