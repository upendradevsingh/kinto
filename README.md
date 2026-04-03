# Kinto

> *Kinetic + Into — ideas move into existence.*

An AI-powered application builder where non-technical users describe what they need in plain English, and the system architects, builds, and deploys a production-ready application.

## Deploy

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fupendradevsingh%2Fkinto&env=DATABASE_URL,OPENAI_API_KEY,NEXTAUTH_SECRET,NEXTAUTH_URL,GOOGLE_CLIENT_ID,GOOGLE_CLIENT_SECRET,GITHUB_CLIENT_ID,GITHUB_CLIENT_SECRET,RESEND_API_KEY,EMAIL_FROM&envDescription=Required%20environment%20variables%20for%20Kinto&envLink=https%3A%2F%2Fgithub.com%2Fupendradevsingh%2Fkinto%2Fblob%2Fmain%2F.env.example&project-name=kinto&repository-name=kinto)

One-click deploy to Vercel. You'll need a [Supabase](https://supabase.com) database (free) and an [OpenAI API key](https://platform.openai.com/api-keys). See the [full deployment guide](docs/DEPLOYMENT.md).

## What Is This?

Think of it as having a **tech co-founder who asks the right questions before writing code.** Unlike other AI code generators that jump straight to code from a prompt, this tool:

1. **Discovers** — Asks smart questions about your requirements (functional, non-functional, scale, integrations)
2. **Architects** — Designs a proper solution based on your answers (data model, page flow, tech decisions)
3. **Builds** — Generates production-quality code feature-by-feature with live preview
4. **Verifies** — Automated checks (security, types, tests) + user approval at every step
5. **Deploys** — One-click deployment to get your app live

## Tech Stack

**Generated apps use:**
- [Next.js 14](https://nextjs.org/) (App Router) — Full-stack React framework
- [TypeScript](https://www.typescriptlang.org/) — Type-safe JavaScript
- [PostgreSQL](https://www.postgresql.org/) — Reliable, scalable database
- [Prisma](https://www.prisma.io/) — Type-safe ORM
- [shadcn/ui](https://ui.shadcn.com/) + [Tailwind CSS](https://tailwindcss.com/) — Beautiful, accessible UI components
- [NextAuth.js](https://next-auth.js.org/) — Authentication
- [Zod](https://zod.dev/) — Runtime validation

**Builder platform uses:**
- Node.js + TypeScript backend
- OpenAI / Anthropic APIs for AI
- WebContainer for live sandboxed preview
- PostgreSQL for project storage
- Redis + BullMQ for job queues

## Documentation

- [Product Requirements Document](docs/PRODUCT-REQUIREMENTS.md) — Full product spec with architecture, conversation design, verification framework, and MVP scope
- [Deployment Guide](docs/DEPLOYMENT.md) — Step-by-step deployment with Vercel + Supabase

## Who Is This For?

| User | Use Case |
|------|----------|
| Non-technical founder | Describe your business → get a working app |
| Small business owner | Need a booking system, inventory tracker, or dashboard? Just describe it |
| Product manager | Prototype ideas before a dev sprint |
| Internal tools builder | Describe the data → get a dashboard |
| Student | Learn full-stack architecture by building |

## How It Works

```
User: "I want a booking system for my salon with 5 stylists"
  │
  ▼
AI: Asks 8-10 smart questions (users, scale, payments, notifications...)
  │
  ▼
AI: Proposes architecture (5 pages, 3 roles, Razorpay, email reminders)
  │
  ▼
User: "Looks good, build it"
  │
  ▼
AI: Generates feature-by-feature with live preview + automated verification
  │
  ▼
User: Reviews each feature, requests changes
  │
  ▼
AI: Final app → one-click deploy → live URL
```

**Total time: ~20 minutes of user interaction**

## Status

🚧 **Under Development** — See the [Product Requirements Document](docs/PRODUCT-REQUIREMENTS.md) for the full specification.

## Why "Kinto"?

**Kinetic + Into** — the energy of your idea moving into reality. You describe it, Kinto brings it to life.

## License

MIT
