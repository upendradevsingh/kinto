# AI App Builder — Product Requirements Document

> An AI-powered application builder where non-technical users describe what they need, and the system architects, builds, and deploys a production-ready application.

**Version:** 1.0  
**Date:** 2026-04-03  
**Status:** Draft  

---

## Table of Contents

1. [Vision & Problem Statement](#1-vision--problem-statement)
2. [Target Users](#2-target-users)
3. [Product Phases](#3-product-phases)
4. [Phase 1 — Discovery & Requirements Gathering](#4-phase-1--discovery--requirements-gathering)
5. [Phase 2 — Architecture & Solution Design](#5-phase-2--architecture--solution-design)
6. [Phase 3 — Code Generation & Build](#6-phase-3--code-generation--build)
7. [Phase 4 — Verification & Review](#7-phase-4--verification--review)
8. [Phase 5 — Deployment](#8-phase-5--deployment)
9. [Tech Stack](#9-tech-stack)
10. [Non-Functional Requirements](#10-non-functional-requirements)
11. [Architecture Overview](#11-architecture-overview)
12. [Conversation Flow Design](#12-conversation-flow-design)
13. [Architecture Decision Matrix](#13-architecture-decision-matrix)
14. [Verification Framework](#14-verification-framework)
15. [MVP Scope](#15-mvp-scope)
16. [Future Roadmap](#16-future-roadmap)

---

## 1. Vision & Problem Statement

### Vision
Enable anyone — regardless of technical background — to build production-quality web applications by simply describing what they need in plain English. The system acts as an AI solutions architect, product manager, and full-stack developer combined.

### Problem
- Non-technical founders, small business owners, and operators have application ideas but no way to build them without hiring developers.
- Existing AI code generators (Lovable, Bolt, v0) generate code from prompts but skip the critical step of *understanding requirements properly*.
- The result: apps that look right but don't handle scale, security, edge cases, or real-world usage.

### Differentiator
**This tool consults before it builds.** It asks smart questions about functional requirements, non-functional requirements, scale, users, and integrations — then designs an architecture before writing a single line of code. Like having a tech co-founder who thinks before coding.

---

## 2. Target Users

| User Type | Example | What They Need |
|-----------|---------|----------------|
| **Non-technical founder** | Salon owner wanting a booking system | Describe the business → get a working app |
| **Small business operator** | Restaurant manager needing inventory tracking | Simple language → functional tool |
| **Product manager** | PM prototyping an idea before dev sprint | Quick MVP to validate with real users |
| **Internal tools builder** | Ops team needing a dashboard | Describe the data → get a dashboard |
| **Student / Learner** | CS student exploring full-stack architecture | Build and learn by seeing how it's structured |

### User Assumptions
- Users do NOT know what PostgreSQL, TypeScript, or APIs are.
- Users CAN describe their business problems clearly.
- Users CAN review a working app and give feedback ("make this button bigger", "add a search bar").
- Users CANNOT review code, debug errors, or configure infrastructure.

---

## 3. Product Phases

The user experience is divided into 5 sequential phases. The system guides the user through each one.

```
┌──────────────┐    ┌──────────────────┐    ┌────────────────┐
│  Phase 1     │───▶│  Phase 2         │───▶│  Phase 3       │
│  Discovery   │    │  Architecture    │    │  Build         │
│  (AI asks)   │    │  (AI proposes)   │    │  (AI generates)│
└──────────────┘    └──────────────────┘    └────────────────┘
                                                     │
                    ┌──────────────────┐    ┌────────▼───────┐
                    │  Phase 5         │◀───│  Phase 4       │
                    │  Deploy          │    │  Verify        │
                    │  (one-click)     │    │  (auto + user) │
                    └──────────────────┘    └────────────────┘
```

---

## 4. Phase 1 — Discovery & Requirements Gathering

### Overview
The AI acts as an intelligent product manager. It asks focused questions to understand what the user wants to build, who will use it, and at what scale.

### Requirements Categories

#### 4.1 Functional Requirements
Questions the AI asks to understand *what* the app does:

- **Core purpose:** "What is the main thing this app should do?"
- **User roles:** "Who will use this? Just you, or customers too? Any admin users?"
- **Key workflows:** "Walk me through what a typical user would do step by step."
- **Data:** "What information do you need to store? (e.g., customer names, orders, appointments)"
- **Features:** "Do you need: login/signup, search, notifications, file uploads, payments, reports?"

#### 4.2 Non-Functional Requirements
Questions the AI asks to understand *how well* the app should perform:

- **Scale:** "How many users do you expect? (10? 100? 10,000?)"
- **Concurrency:** "Will many people use it at the same time?"
- **Availability:** "Does it need to work 24/7, or is some downtime okay?"
- **Performance:** "Should pages load instantly, or is a few seconds acceptable?"
- **Security:** "Will it store sensitive data like payments or personal info?"
- **Compliance:** "Any industry regulations? (healthcare, finance, etc.)"

#### 4.3 Integration Requirements
- **Payments:** "Do users need to pay for anything? (Razorpay, Stripe)"
- **Notifications:** "Should it send emails, SMS, or WhatsApp messages?"
- **Auth providers:** "Should users be able to login with Google, GitHub, etc.?"
- **External APIs:** "Does it need to connect to any other services?"

#### 4.4 UX Requirements
- **Branding:** "Do you have brand colors or a logo?"
- **Device:** "Will people use this on phones, computers, or both?"
- **Accessibility:** "Should it be accessible to users with disabilities?"

### Conversation Design Principles
1. **Max 8-10 questions** — don't interrogate. Branch intelligently based on answers.
2. **Plain language** — never use technical terms. Say "store customer data" not "persist entities in PostgreSQL."
3. **Suggest, don't ask open-ended** — "Do you need payments, notifications, or user accounts?" is better than "What features do you need?"
4. **Infer where possible** — if user says "salon booking system," infer: appointments, time slots, stylist management, customer list. Confirm the inference rather than asking from scratch.
5. **Show progress** — "Great, I understand 80% of what you need. A couple more questions..."

### Output of Phase 1
A structured **Requirements Document** (internal, shown to user in plain language):

```json
{
  "project_name": "Salon Booking System",
  "description": "Online booking system for a hair salon with 5 stylists",
  "functional": {
    "user_roles": ["customer", "stylist", "admin"],
    "core_features": ["appointment_booking", "calendar_view", "customer_management"],
    "additional_features": ["email_reminders", "payment_collection"],
    "workflows": [
      "Customer browses available slots → selects stylist → books appointment → receives confirmation"
    ]
  },
  "non_functional": {
    "expected_users": 500,
    "concurrent_users": 20,
    "availability": "business_hours",
    "data_sensitivity": "medium",
    "performance_tier": "standard"
  },
  "integrations": {
    "payments": "razorpay",
    "notifications": ["email"],
    "auth": ["email_password", "google"]
  },
  "ux": {
    "responsive": true,
    "brand_colors": null,
    "accessibility": "basic"
  }
}
```

---

## 5. Phase 2 — Architecture & Solution Design

### Overview
The AI translates requirements into a technical architecture. The user sees a plain-language summary; the system uses the structured design for code generation.

### What the AI Produces

#### 5.1 Solution Summary (User-Facing)
Shown in plain language:
```
Here's what I'll build for you:

📱 A web app that works on phones and computers
👥 3 types of users: Customers, Stylists, and Admin
📅 Customers can browse available time slots and book appointments
💳 Online payment via Razorpay
📧 Email confirmations and reminders
🔐 Login with email or Google account

Pages:
1. Home — salon info + "Book Now" button
2. Booking — pick a stylist, date, time, service
3. My Appointments — customer's upcoming and past bookings
4. Stylist Dashboard — view today's schedule, mark complete
5. Admin Panel — manage stylists, services, prices, view reports

Does this look right? Anything to add or change?
```

#### 5.2 Data Model (Internal)
```
entities:
  - User (id, name, email, role, avatar, created_at)
  - Stylist (id, user_id, specializations, bio, active)
  - Service (id, name, duration_minutes, price, active)
  - TimeSlot (id, stylist_id, start_time, end_time, is_available)
  - Appointment (id, customer_id, stylist_id, service_id, time_slot_id, status, notes)
  - Payment (id, appointment_id, amount, razorpay_order_id, status)

relationships:
  - User 1:1 Stylist
  - Stylist 1:N TimeSlot
  - Appointment N:1 Customer(User), Stylist, Service, TimeSlot
  - Payment 1:1 Appointment
```

#### 5.3 Architecture Decisions
Based on the NFR answers, the system selects appropriate patterns:

| Decision | Choice | Reason |
|----------|--------|--------|
| Database | Single PostgreSQL instance | <500 users, no sharding needed |
| Caching | None (direct DB queries) | Low concurrency, simple queries |
| Auth | NextAuth.js (email + Google) | Standard auth, easy to set up |
| Payments | Razorpay integration | User specified, Indian market |
| File Storage | Local / S3 | If user needs image uploads |
| API Style | REST (Next.js API routes) | Simpler for this scale |
| Hosting | Single server deployment | Sufficient for expected load |

#### 5.4 Page Flow Diagram (User-Facing, Visual)
```
Landing Page
  ├── Login / Sign Up
  │     ├── Customer → Booking Flow → My Appointments
  │     ├── Stylist → Stylist Dashboard
  │     └── Admin → Admin Panel
  │
  └── Book Now (guest) → Login prompt → Booking Flow
```

### User Checkpoint ✅
User explicitly approves the architecture before code generation begins. They can:
- Add features they forgot
- Remove features they don't need
- Adjust priorities ("payments can come later")

---

## 6. Phase 3 — Code Generation & Build

### Overview
The AI generates a complete, working application based on the approved architecture. Code is generated feature-by-feature, not all at once.

### Generation Strategy

#### 6.1 Project Scaffolding (First)
- Next.js project with TypeScript
- Prisma schema from data model
- shadcn/ui component library setup
- Folder structure following conventions
- Environment configuration

#### 6.2 Feature-by-Feature Generation
Each feature is generated as a complete vertical slice:
1. **Database:** Prisma schema additions + migration
2. **API:** Next.js API routes (CRUD + business logic)
3. **UI:** React components using shadcn/ui
4. **Validation:** Zod schemas for input validation
5. **Tests:** Basic API and component tests

Generation order follows dependency graph:
```
1. Auth (login/signup) — foundation for everything
2. Core entities (stylists, services) — admin can set up data
3. Booking flow — primary user journey
4. Payments — depends on booking
5. Notifications — depends on booking + payment
6. Dashboard/Reports — depends on all data
```

#### 6.3 Code Quality Standards
All generated code must follow:
- **TypeScript strict mode** — no `any` types
- **Prisma best practices** — proper relations, indexes, enums
- **shadcn/ui patterns** — consistent component usage
- **Next.js App Router** — server components where possible, client components where needed
- **Consistent naming** — camelCase variables, PascalCase components, snake_case DB columns
- **Error handling** — every API route has try/catch, meaningful error messages
- **Environment variables** — no hardcoded secrets, `.env.example` provided

#### 6.4 Live Preview
As each feature is generated:
- Code is written to a sandboxed file system
- App is built and rendered in an iframe preview
- User sees the app take shape in real-time
- User can interact with the preview (click buttons, fill forms)

---

## 7. Phase 4 — Verification & Review

### Overview
Two layers of verification ensure the generated application is correct, secure, and matches what the user asked for.

### 7.1 Implicit Verification (Automated, Behind the Scenes)

The user never sees these — they run automatically after every code generation step.

| Check | What It Does | When It Runs |
|-------|-------------|--------------|
| **TypeScript Compilation** | Ensures all code compiles without errors | After every file generation |
| **ESLint** | Code style and common error patterns | After every file generation |
| **Prisma Validation** | Schema is valid, migrations are sound | After schema changes |
| **Security Scan** | SQL injection, XSS, exposed secrets, missing auth on routes | After API route generation |
| **Dependency Check** | No known vulnerable packages | After package.json changes |
| **Build Test** | Full `next build` succeeds | After each feature is complete |
| **Auto-Generated Tests** | API endpoint tests, form validation tests, auth flow tests | After each feature |
| **NFR Compliance** | Cross-reference architecture decisions: indexes present for high-traffic queries, pagination on list endpoints, rate limiting on public APIs, connection pooling configured if scale requires it | After full build |
| **Consistency Check** | Naming conventions, component patterns, folder structure consistent across codebase | After full build |

**Self-Healing:** If any implicit check fails, the AI automatically fixes the issue and re-runs the check. The user only sees the working result. After 3 failed attempts to self-heal, escalate to user with plain-language explanation.

### 7.2 Explicit Verification (User-Facing Checkpoints)

The user actively reviews and approves at these points:

#### Checkpoint 1: Requirements Confirmation
- **When:** After Phase 1 (Discovery)
- **What user sees:** Plain-language summary of what will be built
- **User action:** Approve, modify, or add requirements
- **Gate:** Code generation does NOT start until approved

#### Checkpoint 2: Architecture Review
- **When:** After Phase 2 (Architecture)
- **What user sees:** Page list, user roles, feature list, integration summary
- **User action:** Approve the plan or request changes
- **Gate:** Build does NOT start until approved

#### Checkpoint 3: Feature Preview
- **When:** After each feature is generated (Phase 3)
- **What user sees:** Live preview of the feature in the app
- **User action:** "Looks good" or "Change X" (iterative refinement)
- **Gate:** Next feature does NOT start until current one is accepted
- **Iteration limit:** 3 revision rounds per feature (prevents infinite loops)

#### Checkpoint 4: Final Acceptance
- **When:** After all features are built and verified
- **What user sees:** Complete app walkthrough with checklist:
  ```
  ✅ Users can sign up and log in
  ✅ Customers can browse available slots
  ✅ Customers can book an appointment
  ✅ Payments work via Razorpay
  ✅ Email confirmations are sent
  ✅ Stylists can view their schedule
  ✅ Admin can manage services and prices
  ✅ App works on mobile and desktop
  ```
- **User action:** Approve for deployment or request final changes
- **Gate:** Deployment does NOT start until approved

### 7.3 Verification Flow

```
Generate Feature
       │
       ▼
┌──────────────────┐    FAIL     ┌─────────────┐
│ Implicit Checks  │────────────▶│ AI Self-Heal │──┐
│ (lint, types,    │             └─────────────┘  │
│  security, tests)│◀────────────────────────────┘
└──────────────────┘    (retry, max 3x)
       │ PASS
       ▼
┌──────────────────┐    CHANGE   ┌─────────────┐
│ Explicit Check   │────────────▶│ AI Revise   │──┐
│ (user preview)   │             └─────────────┘  │
└──────────────────┘◀────────────────────────────┘
       │ APPROVED                (max 3 revisions)
       ▼
  Next Feature / Deploy
```

---

## 8. Phase 5 — Deployment

### Overview
One-click deployment for non-technical users. No server configuration, no CLI commands.

### Deployment Options
1. **Managed (Default)** — Deploy to platform-managed infrastructure (Vercel, Railway, or self-hosted)
2. **Export** — Download the complete source code as a ZIP
3. **GitHub Push** — Push to a GitHub repository (if user connects GitHub)

### Deployment Includes
- Application code
- Database provisioning (PostgreSQL)
- Environment variables configuration
- SSL certificate
- Custom domain setup (optional)
- Basic monitoring and health checks

### Post-Deployment
- User gets a live URL
- Admin panel is accessible
- Database is initialized with seed data (if applicable)
- User receives a "Getting Started" guide

---

## 9. Tech Stack

### Generated Application Stack
| Layer | Technology | Why |
|-------|-----------|-----|
| **Framework** | Next.js 14 (App Router) | Full-stack React, server components, API routes |
| **Language** | TypeScript (strict mode) | Type safety, better code generation |
| **UI Library** | shadcn/ui + Tailwind CSS | Beautiful, accessible, consistent components |
| **Database** | PostgreSQL | Reliable, scalable, rich feature set |
| **ORM** | Prisma | Type-safe DB queries, easy migrations |
| **Auth** | NextAuth.js | Flexible, supports multiple providers |
| **Validation** | Zod | Runtime type validation for API inputs |
| **State** | React Server Components + minimal client state | Simple, performant |
| **Payments** | Razorpay / Stripe (configurable) | Based on user's market |
| **Email** | Resend / Nodemailer | Transactional emails |

### Builder Platform Stack
| Layer | Technology | Why |
|-------|-----------|-----|
| **Builder Frontend** | Next.js + shadcn/ui | Same stack as generated apps (dogfooding) |
| **Builder Backend** | Node.js + TypeScript | Orchestration, LLM calls, project management |
| **AI Engine** | OpenAI GPT-4o / Anthropic Claude | Code generation + conversation |
| **Sandbox** | WebContainer (StackBlitz) or Docker | Isolated preview environments |
| **Project Storage** | PostgreSQL | User projects, conversations, generated code |
| **File System** | Virtual FS (in-memory) → Git | Code management and versioning |
| **Queue** | BullMQ + Redis | Background code generation jobs |
| **Deployment** | Vercel API / Docker Compose | One-click deploy for generated apps |

---

## 10. Non-Functional Requirements

### Performance
- AI response time: < 5 seconds for conversation, < 30 seconds for code generation per file
- Live preview: < 3 seconds to reflect changes
- Generated app performance: Lighthouse score > 90

### Scalability
- Builder platform: support 100+ concurrent users building simultaneously
- Each user project is isolated (separate sandbox, separate DB when deployed)

### Security
- User data encrypted at rest and in transit
- Generated apps include OWASP Top 10 protections by default
- Sandboxed execution — user projects cannot affect the builder platform
- API keys and secrets never exposed in generated code

### Reliability
- Builder uptime: 99.9%
- Auto-save every 30 seconds during building
- Project recovery from any checkpoint

### Cost Efficiency
- LLM costs optimized: cache common patterns, use smaller models for simple tasks
- Estimated cost per project generation: $0.50 - $2.00 (LLM API calls)

---

## 11. Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│                    Builder Frontend                       │
│  ┌──────────────┐  ┌──────────────┐  ┌───────────────┐  │
│  │ Chat Panel   │  │ Preview Panel│  │ Code Panel    │  │
│  │ (conversation│  │ (live app    │  │ (optional,    │  │
│  │  with AI)    │  │  preview)    │  │  for devs)    │  │
│  └──────────────┘  └──────────────┘  └───────────────┘  │
└─────────────────────────┬───────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────┐
│                   Builder Backend (Node.js)               │
│  ┌──────────────┐  ┌──────────────┐  ┌───────────────┐  │
│  │ Conversation │  │ Architecture │  │ Code          │  │
│  │ Engine       │  │ Decision     │  │ Generator     │  │
│  │ (state       │  │ Engine       │  │ (LLM +        │  │
│  │  machine)    │  │ (rule-based) │  │  templates)   │  │
│  └──────────────┘  └──────────────┘  └───────────────┘  │
│  ┌──────────────┐  ┌──────────────┐  ┌───────────────┐  │
│  │ Verification │  │ Project      │  │ Deployment    │  │
│  │ Pipeline     │  │ Manager      │  │ Service       │  │
│  │ (lint, test, │  │ (CRUD,       │  │ (Vercel/      │  │
│  │  security)   │  │  versioning) │  │  Docker)      │  │
│  └──────────────┘  └──────────────┘  └───────────────┘  │
└─────────────────────────┬───────────────────────────────┘
                          │
              ┌───────────┼───────────┐
              ▼           ▼           ▼
        ┌──────────┐ ┌────────┐ ┌──────────┐
        │PostgreSQL│ │ Redis  │ │ Sandbox  │
        │(projects,│ │(queue, │ │(WebContainer
        │ convos)  │ │ cache) │ │ or Docker)│
        └──────────┘ └────────┘ └──────────┘
```

---

## 12. Conversation Flow Design

### State Machine

```
START
  │
  ▼
GREETING ──▶ "Hi! I'll help you build an app. What do you want to create?"
  │
  ▼
CORE_PURPOSE ──▶ "What is the main thing this app should do?"
  │
  ├── (User answers) ──▶ AI infers domain (booking, inventory, CRM, etc.)
  │
  ▼
SMART_INFERENCE ──▶ "Sounds like a [booking system]. Usually these need:
  │                   - Customer accounts
  │                   - Appointment scheduling
  │                   - Calendar view
  │                   Does that sound right? Anything to add?"
  │
  ├── (User confirms/adjusts)
  │
  ▼
USER_ROLES ──▶ "Who will use this app? Just you, or customers too?"
  │
  ▼
SCALE ──▶ "How many people will use this? Just a rough estimate."
  │
  ▼
INTEGRATIONS ──▶ "Do you need payments, email notifications, or login with Google?"
  │
  ▼
NICE_TO_HAVE ──▶ "Any other features you're thinking about? I can add these now or later."
  │
  ▼
SUMMARY ──▶ [Show requirements summary] "Does this look right?"
  │
  ├── YES ──▶ Phase 2 (Architecture)
  └── CHANGE ──▶ Back to relevant question
```

### Conversation Rules
1. **Max 2 questions per message** — don't overwhelm
2. **Always offer options** — "Do you need A, B, or C?" not "What do you need?"
3. **Confirm inferences** — "I'm guessing you need X because you said Y. Right?"
4. **Progressive disclosure** — start simple, get detailed only where needed
5. **Remember everything** — user shouldn't repeat themselves

---

## 13. Architecture Decision Matrix

The AI uses this matrix to select appropriate patterns based on user requirements:

### Scale Decisions
| Expected Users | Database | Caching | Connection Pool | CDN |
|---------------|----------|---------|-----------------|-----|
| < 100 | Single PostgreSQL | None | Default | No |
| 100 - 1,000 | Single PostgreSQL | Redis (sessions) | pgBouncer | Optional |
| 1,000 - 10,000 | PostgreSQL + read replica | Redis (sessions + queries) | pgBouncer | Yes |
| > 10,000 | PostgreSQL cluster | Redis cluster | pgBouncer | Yes |

### Auth Decisions
| Requirement | Solution |
|------------|----------|
| Email + password only | NextAuth.js Credentials |
| Social login (Google, GitHub) | NextAuth.js OAuth |
| Enterprise SSO | NextAuth.js + SAML |
| API-only (no UI) | JWT with refresh tokens |

### Payment Decisions
| Market | Provider | Why |
|--------|----------|-----|
| India | Razorpay | UPI, Indian cards, easy KYC |
| Global | Stripe | Widest coverage, best docs |
| Both | Stripe + Razorpay | Route by customer location |

### Feature Decisions
| Feature Need | Pattern |
|-------------|---------|
| Real-time updates | WebSocket (Socket.io) or Server-Sent Events |
| File uploads | S3 + presigned URLs |
| Search | PostgreSQL full-text (small), Elasticsearch (large) |
| Multi-tenancy | Row-level security (RLS) in PostgreSQL |
| Background jobs | BullMQ + Redis |
| Audit log | Append-only table, triggered on mutations |

---

## 14. Verification Framework

### 14.1 Implicit Checks (Automated)

```yaml
checks:
  compilation:
    tool: tsc --noEmit
    when: after_every_file
    severity: blocking
    self_heal: true

  linting:
    tool: eslint --fix
    when: after_every_file
    severity: warning
    self_heal: true

  schema_validation:
    tool: prisma validate
    when: after_schema_change
    severity: blocking
    self_heal: true

  security:
    checks:
      - no_sql_injection: "Parameterized queries only (Prisma handles this)"
      - no_xss: "React auto-escapes, dangerouslySetInnerHTML banned"
      - no_exposed_secrets: "Scan for hardcoded keys, tokens, passwords"
      - auth_on_routes: "Every API route checks session/auth"
      - csrf_protection: "Enabled by default in Next.js"
      - rate_limiting: "Applied on public endpoints"
    when: after_api_route_generation
    severity: blocking
    self_heal: true

  build:
    tool: next build
    when: after_each_feature
    severity: blocking
    self_heal: true

  tests:
    tool: jest / vitest
    when: after_each_feature
    severity: warning
    self_heal: true
    coverage_target: "> 70% for generated code"

  nfr_compliance:
    checks:
      - indexes: "Verify indexes on columns used in WHERE clauses"
      - pagination: "All list endpoints use cursor or offset pagination"
      - rate_limiting: "Public APIs have rate limits configured"
      - connection_pooling: "Configured if scale > 500 users"
      - error_handling: "All API routes have try/catch with meaningful messages"
    when: after_full_build
    severity: warning
    self_heal: true

  consistency:
    checks:
      - naming: "camelCase vars, PascalCase components, snake_case DB"
      - imports: "Consistent import ordering"
      - component_patterns: "All forms use same validation approach"
      - folder_structure: "Follows project conventions"
    when: after_full_build
    severity: warning
    self_heal: true
```

### 14.2 Explicit Checkpoints

```yaml
checkpoints:
  requirements_confirmation:
    phase: after_discovery
    blocks: architecture_design
    user_sees: "Plain-language requirements summary"
    user_actions: [approve, modify, add]
    max_iterations: unlimited

  architecture_review:
    phase: after_architecture
    blocks: code_generation
    user_sees: "Page list, roles, features, integrations"
    user_actions: [approve, modify, reprioritize]
    max_iterations: 3

  feature_preview:
    phase: after_each_feature
    blocks: next_feature
    user_sees: "Live interactive preview of the feature"
    user_actions: [approve, request_change]
    max_iterations: 3_per_feature

  final_acceptance:
    phase: after_all_features
    blocks: deployment
    user_sees: "Full app walkthrough + feature checklist"
    user_actions: [approve, request_changes]
    max_iterations: 2
```

---

## 15. MVP Scope

### In Scope (MVP)
- [ ] Chat-based discovery (8-10 smart questions)
- [ ] Requirements summary generation + user approval
- [ ] Architecture proposal (data model, page flow, tech decisions)
- [ ] Code generation for: Next.js + TypeScript + Prisma + shadcn/ui
- [ ] Live preview (WebContainer sandbox)
- [ ] Implicit verification: TypeScript compilation + ESLint + Prisma validation
- [ ] Explicit verification: Requirements confirmation + architecture review + final acceptance
- [ ] Feature-by-feature generation with previews
- [ ] Auth (email/password + Google via NextAuth.js)
- [ ] Basic CRUD operations generation
- [ ] Export as ZIP
- [ ] Project save/load

### Out of Scope (MVP)
- Payment integration generation (Phase 2)
- One-click cloud deployment (Phase 2)
- Custom domain setup (Phase 2)
- Real-time features / WebSocket generation (Phase 2)
- Team collaboration on projects (Phase 3)
- Version history / rollback (Phase 3)
- Plugin/marketplace system (Phase 3)
- Mobile app generation (Future)

### MVP Timeline
| Week | Milestone |
|------|-----------|
| 1-2 | Builder UI (chat + preview panels) + LLM integration |
| 3-4 | Conversation engine (discovery state machine) + architecture proposal |
| 5-6 | Code generation pipeline (scaffold + auth + CRUD) |
| 7 | Sandbox preview (WebContainer integration) |
| 8 | Verification pipeline (implicit + explicit checkpoints) |
| 9 | Export + project management |
| 10 | Testing, polish, documentation |

---

## 16. Future Roadmap

### Phase 2 — Enhanced Generation
- Payment integration (Razorpay / Stripe)
- Email notification generation
- File upload support
- One-click deployment (Vercel / Railway)
- Custom domain setup
- More UI themes / templates

### Phase 3 — Collaboration & Scale
- Team workspaces
- Version control / rollback
- A/B testing of generated UIs
- Analytics dashboard for generated apps
- Custom component library support

### Phase 4 — Platform
- Template marketplace (pre-built app templates)
- Plugin system (community-built integrations)
- AI-powered maintenance (auto-fix bugs, apply updates)
- Multi-framework support (React Native, Vue, etc.)

### Phase 5 — Enterprise
- Self-hosted deployment option
- SSO / SAML integration for builder
- Audit logs
- Compliance certifications
- White-label builder for agencies

---

## Appendix A: Glossary (for Non-Technical Readers)

| Term | What It Means |
|------|--------------|
| **API** | How different parts of the app talk to each other |
| **Database** | Where the app stores information (like a spreadsheet, but smarter) |
| **PostgreSQL** | A specific type of database — very reliable and widely used |
| **TypeScript** | A programming language — like JavaScript but catches errors earlier |
| **shadcn/ui** | A collection of pre-built, beautiful UI components (buttons, forms, etc.) |
| **Prisma** | A tool that makes it easy to save/load data from the database |
| **Next.js** | A framework for building web apps — handles both the website and the server |
| **Sandbox** | An isolated environment where the app runs safely during preview |
| **Migration** | Updating the database structure (like adding a new column to a spreadsheet) |

---

## Appendix B: Example — Full Flow

**User:** "I want to build a task manager for my team of 15 people"

**Phase 1 (Discovery):**
- AI asks about team size, roles, features needed
- Learns: 15 users, 1 admin, task creation/assignment, due dates, status tracking, Slack notifications

**Phase 2 (Architecture):**
- Proposes: 2 roles (admin, member), 4 pages, PostgreSQL (no caching needed at this scale), email auth
- User approves

**Phase 3 (Build):**
- Generates auth → user profiles → task CRUD → assignment flow → dashboard → notifications
- User previews each step

**Phase 4 (Verify):**
- Implicit: all TypeScript compiles, no security issues, tests pass
- Explicit: user walks through the app, confirms it works as expected

**Phase 5 (Deploy):**
- User clicks "Deploy" → gets a live URL
- Shares with team → they start using it

**Total time: ~20 minutes of user interaction**

---

*This document is the foundation for building the AI App Builder. It should be treated as a living document — updated as we learn from user feedback and technical discoveries.*
