import { Requirements } from '../conversation/questions'

export interface ArchitectureDecisions {
  database: string
  caching: string
  auth: string[]
  payments: string | null
  notifications: string | null
  hosting: string
  pages: PageDefinition[]
  dataEntities: string[]
}

export interface PageDefinition {
  name: string
  path: string
  description: string
  requiresAuth: boolean
  roles: string[]
}

export function makeArchitectureDecisions(requirements: Partial<Requirements>): ArchitectureDecisions {
  const users = requirements.expectedUsers ?? 50
  const roles = requirements.userRoles ?? ['user']
  const hasPayments = requirements.integrations?.payments ?? false
  const hasNotifications = requirements.integrations?.notifications ?? false
  const authMethods = requirements.integrations?.auth ?? ['email']

  // Scale-based infrastructure decisions
  const database = 'PostgreSQL'
  const caching = users > 1000 ? 'Redis for sessions' : 'None needed'
  const hosting = users > 5000 ? 'Multiple servers' : 'Single server'

  // Core pages every app needs
  const pages: PageDefinition[] = [
    {
      name: 'Home',
      path: '/',
      description: 'Landing page',
      requiresAuth: false,
      roles: [],
    },
    {
      name: 'Sign In',
      path: '/auth/signin',
      description: 'Login and registration',
      requiresAuth: false,
      roles: [],
    },
  ]

  // Role-specific pages
  if (roles.includes('admin') || roles.includes('manager')) {
    pages.push({
      name: 'Admin Dashboard',
      path: '/admin',
      description: 'Manage everything',
      requiresAuth: true,
      roles: ['admin', 'manager'],
    })
  }

  pages.push({
    name: 'Dashboard',
    path: '/dashboard',
    description: 'Main user interface',
    requiresAuth: true,
    roles: roles,
  })

  // Feature-specific pages
  const features = [
    ...(requirements.coreFeatures ?? []),
    ...(requirements.additionalFeatures ?? []),
  ]

  if (features.some(f => f.includes('list') || f.includes('browse') || f.includes('catalog'))) {
    pages.push({
      name: 'Browse',
      path: '/browse',
      description: 'Browse and search items',
      requiresAuth: false,
      roles: [],
    })
  }

  if (features.some(f => f.includes('profile') || f.includes('account') || f.includes('settings'))) {
    pages.push({
      name: 'Profile',
      path: '/profile',
      description: 'User account settings',
      requiresAuth: true,
      roles: roles,
    })
  }

  // Data entities based on domain
  const dataEntities = inferDataEntities(requirements)

  return {
    database,
    caching,
    auth: authMethods,
    payments: hasPayments ? 'Stripe' : null,
    notifications: hasNotifications ? 'Email via Resend' : null,
    hosting,
    pages,
    dataEntities,
  }
}

function inferDataEntities(requirements: Partial<Requirements>): string[] {
  const entities = ['User']
  const domain = requirements.domain ?? ''
  const features = [
    ...(requirements.coreFeatures ?? []),
    ...(requirements.additionalFeatures ?? []),
    requirements.description ?? '',
  ].join(' ').toLowerCase()

  // Domain-specific entities
  if (domain === 'booking' || features.includes('booking') || features.includes('appointment')) {
    entities.push('Appointment', 'TimeSlot', 'Service')
  }
  if (domain === 'inventory' || features.includes('inventory') || features.includes('stock')) {
    entities.push('Product', 'Category', 'StockMovement')
  }
  if (domain === 'crm' || features.includes('customer') || features.includes('contact')) {
    entities.push('Contact', 'Company', 'Deal')
  }
  if (domain === 'marketplace' || features.includes('listing') || features.includes('sell')) {
    entities.push('Listing', 'Order', 'Review')
  }
  if (domain === 'dashboard' || features.includes('task') || features.includes('project')) {
    entities.push('Task', 'Project', 'Team')
  }
  if (features.includes('payment') || features.includes('invoice') || features.includes('billing')) {
    entities.push('Payment', 'Invoice')
  }
  if (features.includes('notification') || features.includes('message')) {
    entities.push('Notification')
  }

  // Always include roles if multiple user types
  if ((requirements.userRoles ?? []).length > 1) {
    entities.push('Role')
  }

  return Array.from(new Set(entities)) // deduplicate
}
