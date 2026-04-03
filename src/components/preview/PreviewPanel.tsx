'use client'

import { useState } from 'react'
import { Monitor, RefreshCw } from 'lucide-react'

interface PreviewPanelProps {
  previewHtml: string | null
  projectName?: string
}

export function PreviewPanel({ previewHtml, projectName }: PreviewPanelProps) {
  const [refreshKey, setRefreshKey] = useState(0)

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Toolbar */}
      <div className="flex items-center gap-2 px-3 py-2 border-b bg-muted/20 shrink-0">
        <Monitor className="h-3.5 w-3.5 text-muted-foreground" />
        <span className="text-xs text-muted-foreground flex-1 truncate font-medium">
          {projectName ? `Preview — ${projectName}` : 'Preview'}
        </span>
        {previewHtml && (
          <button
            onClick={() => setRefreshKey(k => k + 1)}
            className="text-muted-foreground hover:text-foreground transition-colors p-0.5 rounded"
            title="Refresh preview"
          >
            <RefreshCw className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 relative overflow-hidden bg-white">
        {previewHtml ? (
          <iframe
            key={refreshKey}
            srcDoc={previewHtml}
            className="w-full h-full border-0"
            sandbox="allow-scripts allow-same-origin"
            title="App Preview"
          />
        ) : (
          <div className="flex flex-col items-center justify-center h-full gap-3 text-center px-6 bg-background">
            <div className="rounded-full bg-muted p-4">
              <Monitor className="h-8 w-8 text-muted-foreground/50" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Preview will appear here</p>
              <p className="text-xs text-muted-foreground/70 mt-1 max-w-48">
                Once Kinto generates your app, a visual preview will show here
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
