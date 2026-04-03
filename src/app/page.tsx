import { prisma } from '@/lib/db'
import Link from 'next/link'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/auth'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Plus, Zap, FolderOpen, Clock, ArrowRight, LogIn, KeyRound, Settings } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { SignOutButton } from '@/components/auth/SignOutButton'

const PHASE_LABELS: Record<string, string> = {
  DISCOVERY: 'Discovering',
  ARCHITECTURE: 'Designing',
  GENERATION: 'Building',
  COMPLETE: 'Complete',
}

export default async function HomePage() {
  const session = await getServerSession(authOptions)

  let projects: Array<{
    id: string
    name: string
    description: string | null
    phase: string
    updatedAt: Date
  }> = []

  if (session?.user?.id) {
    try {
      projects = await prisma.project.findMany({
        where: { userId: session.user.id },
        orderBy: { updatedAt: 'desc' },
        take: 20,
        select: {
          id: true,
          name: true,
          description: true,
          phase: true,
          updatedAt: true,
        },
      })
    } catch {
      // DB might not be available — show empty state
    }
  }

  let hasApiKey = false
  if (session?.user?.id) {
    try {
      const apiKey = await prisma.apiKey.findUnique({
        where: { userId: session.user.id },
        select: { id: true },
      })
      hasApiKey = !!apiKey
    } catch {
      // ignore
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 max-w-5xl items-center px-4 mx-auto">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary">
              <Zap className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="font-bold text-lg tracking-tight">Kinto</span>
          </div>
          <p className="ml-4 text-sm text-muted-foreground hidden sm:block">
            Describe it. It exists.
          </p>
          <div className="ml-auto flex items-center gap-3">
            {session?.user ? (
              <>
                {session.user.image ? (
                  <img
                    src={session.user.image}
                    alt={session.user.name ?? ''}
                    className="h-7 w-7 rounded-full"
                  />
                ) : (
                  <div className="h-7 w-7 rounded-full bg-muted flex items-center justify-center text-xs font-medium">
                    {(session.user.name ?? session.user.email ?? '?')[0].toUpperCase()}
                  </div>
                )}
                <span className="text-sm text-muted-foreground hidden sm:block">
                  {session.user.name ?? session.user.email}
                </span>
                <Link href="/settings/api-keys">
                  <Button size="sm" variant="ghost" className="gap-1.5">
                    <Settings className="h-3.5 w-3.5" />
                    <span className="hidden sm:inline text-xs">Settings</span>
                  </Button>
                </Link>
                <Link href="/builder">
                  <Button size="sm" className="gap-2">
                    <Plus className="h-3.5 w-3.5" />
                    New App
                  </Button>
                </Link>
                <SignOutButton />
              </>
            ) : (
              <Link href="/auth/signin">
                <Button size="sm" variant="outline" className="gap-2">
                  <LogIn className="h-3.5 w-3.5" />
                  Sign in
                </Button>
              </Link>
            )}
          </div>
        </div>
      </header>

      {session?.user && !hasApiKey && (
        <div className="border-b bg-amber-50 dark:bg-amber-950/20">
          <div className="container max-w-5xl mx-auto px-4 py-2.5 flex items-center gap-3">
            <KeyRound className="h-4 w-4 text-amber-600 shrink-0" />
            <p className="text-sm text-amber-800 dark:text-amber-200">
              Add your OpenAI API key to start building
            </p>
            <Link href="/settings/api-keys" className="ml-auto">
              <Button size="sm" variant="outline" className="gap-1.5 border-amber-400 text-amber-800 hover:bg-amber-100 dark:text-amber-200 dark:border-amber-600 dark:hover:bg-amber-900/30">
                Add API key
                <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </Link>
          </div>
        </div>
      )}

      <main className="container max-w-5xl mx-auto px-4">
        {/* Hero section */}
        <section className="py-20 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border bg-muted/50 px-4 py-1.5 text-sm text-muted-foreground mb-6">
            <Zap className="h-3.5 w-3.5 text-primary" />
            AI-Powered App Builder
          </div>

          <h1 className="text-5xl sm:text-6xl font-bold tracking-tight mb-5">
            Describe it.{' '}
            <span className="text-primary">It exists.</span>
          </h1>

          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-3">
            Tell Kinto what you want to build. It asks smart questions, designs the
            architecture, and generates production-ready code — feature by feature.
          </p>

          <p className="text-sm text-muted-foreground mb-10">
            No coding required. No jargon. Just describe your idea.
          </p>

          <div className="flex items-center justify-center gap-4">
            {session?.user ? (
              <Link href="/builder">
                <Button size="lg" className="gap-2 text-base px-8">
                  Start Building
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            ) : (
              <Link href="/auth/signin">
                <Button size="lg" className="gap-2 text-base px-8">
                  Get Started
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            )}
          </div>
        </section>

        {/* Features row */}
        <section className="pb-16 grid sm:grid-cols-3 gap-6 text-center">
          {[
            {
              icon: '💬',
              title: 'Smart Discovery',
              description: '8-10 focused questions to understand exactly what you need',
            },
            {
              icon: '🏗️',
              title: 'Architecture First',
              description: 'Reviews the plan with you before writing a single line of code',
            },
            {
              icon: '⚡',
              title: 'Real Code',
              description: 'Generates production-ready Next.js + TypeScript, not just wireframes',
            },
          ].map(feature => (
            <div key={feature.title} className="p-6 rounded-xl border bg-muted/20">
              <div className="text-3xl mb-3">{feature.icon}</div>
              <h3 className="font-semibold mb-2">{feature.title}</h3>
              <p className="text-sm text-muted-foreground">{feature.description}</p>
            </div>
          ))}
        </section>

        {/* Projects section */}
        {session?.user && projects.length > 0 && (
          <section className="pb-20">
            <div className="flex items-center gap-2 mb-6">
              <FolderOpen className="h-5 w-5 text-muted-foreground" />
              <h2 className="text-xl font-semibold">Your Projects</h2>
              <span className="text-sm text-muted-foreground">({projects.length})</span>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {projects.map(project => (
                <Link key={project.id} href={`/builder/${project.id}`}>
                  <Card className="h-full hover:shadow-md hover:border-primary/30 transition-all cursor-pointer group">
                    <CardHeader className="pb-2">
                      <div className="flex items-start justify-between gap-2">
                        <CardTitle className="text-base group-hover:text-primary transition-colors line-clamp-1">
                          {project.name}
                        </CardTitle>
                        <Badge
                          variant={project.phase === 'COMPLETE' ? 'default' : 'secondary'}
                          className="shrink-0 text-xs"
                        >
                          {PHASE_LABELS[project.phase] ?? project.phase}
                        </Badge>
                      </div>
                      {project.description && (
                        <CardDescription className="line-clamp-2 text-sm mt-1">
                          {project.description}
                        </CardDescription>
                      )}
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {formatDistanceToNow(project.updatedAt, { addSuffix: true })}
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  )
}
