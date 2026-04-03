import { Requirements } from '../conversation/questions'
import { makeArchitectureDecisions } from './decision-engine'

/**
 * Build a context string to append to the ARCHITECTURE_SYSTEM_PROMPT.
 * This gives the AI specific decisions to include in its proposal.
 */
export function buildArchitectureContext(requirements: Partial<Requirements>): string {
  const decisions = makeArchitectureDecisions(requirements)

  const pageList = decisions.pages
    .map((p, i) => `${i + 1}. ${p.name} (${p.path}) — ${p.description}`)
    .join('\n')

  const entityList = decisions.dataEntities.join(', ')

  return `
Based on the requirements, here are the technical decisions (translate to plain language in your response):
- Database: ${decisions.database}
- Caching: ${decisions.caching}
- Auth: ${decisions.auth.join(' + ')}
- Payments: ${decisions.payments ?? 'Not needed'}
- Notifications: ${decisions.notifications ?? 'Not needed'}
- Hosting: ${decisions.hosting}

Suggested pages:
${pageList}

Core data to store: ${entityList}

Requirements summary:
${JSON.stringify(requirements, null, 2)}

In your architecture JSON block, use exactly this structure and include all the pages above.
`.trim()
}
