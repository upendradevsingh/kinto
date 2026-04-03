import { Requirements } from './questions'

export function extractRequirementsFromMessage(message: string): Partial<Requirements> | null {
  const match = message.match(/```requirements\n([\s\S]*?)```/)
  if (!match) return null
  try {
    return JSON.parse(match[1].trim()) as Partial<Requirements>
  } catch {
    return null
  }
}

export function extractArchitectureFromMessage(message: string): object | null {
  const match = message.match(/```architecture\n([\s\S]*?)```/)
  if (!match) return null
  try {
    return JSON.parse(match[1].trim())
  } catch {
    return null
  }
}

export function extractGeneratedFiles(message: string): Record<string, string> {
  const files: Record<string, string> = {}
  const fileRegex = /```file:([\w./\-]+)\n([\s\S]*?)```/g
  let match
  while ((match = fileRegex.exec(message)) !== null) {
    files[match[1]] = match[2]
  }
  return files
}

export function extractPreviewHtml(message: string): string | null {
  const match = message.match(/```preview-html\n([\s\S]*?)```/)
  return match ? match[1].trim() : null
}

/**
 * Remove internal JSON/code blocks from the message before displaying to user.
 * Keeps regular code blocks intact (for showing generated file contents).
 */
export function cleanMessageForDisplay(message: string): string {
  return message
    .replace(/```requirements\n[\s\S]*?```/g, '')
    .replace(/```architecture\n[\s\S]*?```/g, '')
    .replace(/```file:[\w./\-]+\n[\s\S]*?```/g, (match) => {
      // Extract just the filename for display
      const filenameMatch = match.match(/```file:([\w./\-]+)/)
      if (filenameMatch) {
        return `\n📄 \`${filenameMatch[1]}\` generated\n`
      }
      return '\n📄 File generated\n'
    })
    .replace(/```preview-html\n[\s\S]*?```/g, '')
    .trim()
}
