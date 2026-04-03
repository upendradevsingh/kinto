import { ConversationPhase } from './questions'
import { DISCOVERY_SYSTEM_PROMPT, ARCHITECTURE_SYSTEM_PROMPT, GENERATION_SYSTEM_PROMPT, BASE_SYSTEM_PROMPT } from './questions'

export interface ConversationState {
  phase: ConversationPhase
  questionCount: number
  awaitingArchitectureConfirmation: boolean
}

export function getInitialState(): ConversationState {
  return {
    phase: 'GREETING',
    questionCount: 0,
    awaitingArchitectureConfirmation: false,
  }
}

export function detectPhaseTransition(
  currentPhase: ConversationPhase,
  assistantMessage: string,
  userMessage: string
): ConversationPhase {
  // Requirements block in assistant response → move to ARCHITECTURE
  if (assistantMessage.includes('```requirements')) {
    return 'ARCHITECTURE'
  }

  // Architecture block + user approval → move to GENERATION
  if (
    currentPhase === 'ARCHITECTURE' &&
    assistantMessage.includes('```architecture')
  ) {
    const approval = userMessage.toLowerCase()
    if (
      approval.includes('yes') ||
      approval.includes('build') ||
      approval.includes('start') ||
      approval.includes('go') ||
      approval.includes('great') ||
      approval.includes('looks good') ||
      approval.includes('perfect') ||
      approval.includes('ok') ||
      approval.includes('sure')
    ) {
      return 'GENERATION'
    }
  }

  return currentPhase
}

export function getSystemPromptForPhase(phase: ConversationPhase): string {
  switch (phase) {
    case 'GREETING':
    case 'CORE_PURPOSE':
    case 'SMART_INFERENCE':
    case 'USER_ROLES':
    case 'SCALE':
    case 'INTEGRATIONS':
    case 'NICE_TO_HAVE':
    case 'SUMMARY':
      return DISCOVERY_SYSTEM_PROMPT
    case 'ARCHITECTURE':
      return ARCHITECTURE_SYSTEM_PROMPT
    case 'GENERATION':
      return GENERATION_SYSTEM_PROMPT
    default:
      return BASE_SYSTEM_PROMPT
  }
}

export function isDiscoveryPhase(phase: ConversationPhase): boolean {
  return ['GREETING', 'CORE_PURPOSE', 'SMART_INFERENCE', 'USER_ROLES', 'SCALE', 'INTEGRATIONS', 'NICE_TO_HAVE', 'SUMMARY'].includes(phase)
}
