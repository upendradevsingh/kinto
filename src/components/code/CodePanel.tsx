'use client'

import { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'
import { FileTabs } from './FileTabs'
import { Code2 } from 'lucide-react'

// Load Monaco dynamically — it's browser-only
const MonacoEditor = dynamic(
  () => import('@monaco-editor/react').then(mod => mod.default),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center h-full text-muted-foreground text-xs">
        Loading editor...
      </div>
    ),
  }
)

interface CodePanelProps {
  files: Record<string, string>
}

function getLanguage(filename: string): string {
  if (filename.endsWith('.tsx') || filename.endsWith('.ts')) return 'typescript'
  if (filename.endsWith('.jsx') || filename.endsWith('.js')) return 'javascript'
  if (filename.endsWith('.prisma')) return 'prisma'
  if (filename.endsWith('.css')) return 'css'
  if (filename.endsWith('.json')) return 'json'
  if (filename.endsWith('.md') || filename.endsWith('.mdx')) return 'markdown'
  if (filename.endsWith('.env') || filename.endsWith('.env.example')) return 'ini'
  return 'plaintext'
}

export function CodePanel({ files }: CodePanelProps) {
  const fileList = Object.keys(files)
  const [activeFile, setActiveFile] = useState<string | null>(null)

  // Set initial active file, or update if current active is gone
  useEffect(() => {
    if (fileList.length > 0) {
      if (!activeFile || !files[activeFile]) {
        setActiveFile(fileList[0])
      }
    } else {
      setActiveFile(null)
    }
  }, [files, activeFile, fileList])

  return (
    <div className="flex flex-col h-full bg-[#1e1e1e]">
      {/* Header */}
      <div className="flex items-center gap-2 px-3 py-2 border-b border-[#3c3c3c] bg-[#252526] shrink-0">
        <Code2 className="h-3.5 w-3.5 text-gray-400" />
        <span className="text-xs text-gray-400 font-medium">Code</span>
        {fileList.length > 0 && (
          <span className="ml-auto text-xs text-gray-500">
            {fileList.length} file{fileList.length !== 1 ? 's' : ''}
          </span>
        )}
      </div>

      {fileList.length === 0 ? (
        <div className="flex flex-col items-center justify-center flex-1 gap-3 text-center px-6">
          <div className="rounded-full bg-[#3c3c3c] p-4">
            <Code2 className="h-8 w-8 text-gray-500" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-400">Generated code will appear here</p>
            <p className="text-xs text-gray-500 mt-1 max-w-48">
              Kinto will generate Next.js + TypeScript code for your app
            </p>
          </div>
        </div>
      ) : (
        <>
          <FileTabs
            files={fileList}
            activeFile={activeFile}
            onSelect={setActiveFile}
          />
          <div className="flex-1 overflow-hidden">
            {activeFile && files[activeFile] !== undefined && (
              <MonacoEditor
                height="100%"
                language={getLanguage(activeFile)}
                value={files[activeFile]}
                theme="vs-dark"
                options={{
                  readOnly: true,
                  minimap: { enabled: false },
                  scrollBeyondLastLine: false,
                  fontSize: 12,
                  lineNumbers: 'on',
                  wordWrap: 'on',
                  automaticLayout: true,
                  padding: { top: 8, bottom: 8 },
                  renderLineHighlight: 'none',
                  scrollbar: {
                    verticalScrollbarSize: 8,
                    horizontalScrollbarSize: 8,
                  },
                }}
              />
            )}
          </div>
        </>
      )}
    </div>
  )
}
