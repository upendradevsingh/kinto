# Kinto — Deployment Guide

## Quick Deploy (Recommended)

### Prerequisites
1. A [Vercel](https://vercel.com) account (free)
2. A [Supabase](https://supabase.com) project (free tier — 500MB PostgreSQL)
3. An [OpenAI](https://platform.openai.com) API key
4. OAuth credentials (see below)

### Step 1: Create Supabase Database

1. Go to [supabase.com/dashboard](https://supabase.com/dashboard)
2. Click **New Project**
3. Choose a name (e.g., `kinto-db`), set a database password, select a region
4. Once created, go to **Settings → Database → Connection string → URI**
5. Copy the URI — this is your `DATABASE_URL`

> **Tip:** Use the "Transaction" mode connection string for serverless environments like Vercel.

### Step 2: Deploy to Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fupendradevsingh%2Fkinto&env=DATABASE_URL,OPENAI_API_KEY,NEXTAUTH_SECRET,NEXTAUTH_URL,GOOGLE_CLIENT_ID,GOOGLE_CLIENT_SECRET,GITHUB_CLIENT_ID,GITHUB_CLIENT_SECRET,RESEND_API_KEY,EMAIL_FROM&envDescription=Required%20environment%20variables%20for%20Kinto&envLink=https%3A%2F%2Fgithub.com%2Fupendradevsingh%2Fkinto%2Fblob%2Fmain%2F.env.example&project-name=kinto&repository-name=kinto)

Click the button above, then fill in the environment variables:

| Variable | Where to Get It |
|----------|----------------|
| `DATABASE_URL` | Supabase → Settings → Database → Connection string |
| `OPENAI_API_KEY` | [platform.openai.com/api-keys](https://platform.openai.com/api-keys) |
| `NEXTAUTH_SECRET` | Run `openssl rand -base64 32` in your terminal |
| `NEXTAUTH_URL` | Your Vercel deployment URL (e.g., `https://kinto-xxx.vercel.app`) |
| `GOOGLE_CLIENT_ID` | Google Cloud Console (see OAuth Setup below) |
| `GOOGLE_CLIENT_SECRET` | Google Cloud Console |
| `GITHUB_CLIENT_ID` | GitHub Developer Settings (see OAuth Setup below) |
| `GITHUB_CLIENT_SECRET` | GitHub Developer Settings |
| `RESEND_API_KEY` | [resend.com/api-keys](https://resend.com/api-keys) |
| `EMAIL_FROM` | Your verified Resend sender email |

### Step 3: Run Database Migrations

After deployment, run migrations against your Supabase database:

```bash
# Clone the repo locally (if not already)
git clone https://github.com/upendradevsingh/kinto.git
cd kinto

# Set your DATABASE_URL
export DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@db.YOUR_PROJECT.supabase.co:5432/postgres"

# Run migrations
npx prisma migrate deploy
```

Or use the Supabase SQL Editor to run the generated SQL from `prisma/migrations/`.

### Step 4: Update NEXTAUTH_URL

After Vercel deploys, grab your deployment URL and update the `NEXTAUTH_URL` environment variable:
1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Set `NEXTAUTH_URL` to `https://your-project.vercel.app`
3. Redeploy

---

## OAuth Setup

### Google OAuth

1. Go to [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
2. Create a new project (or select existing)
3. Go to **APIs & Services → Credentials → Create Credentials → OAuth 2.0 Client ID**
4. Application type: **Web application**
5. Authorized JavaScript origins: `https://your-project.vercel.app`
6. Authorized redirect URIs: `https://your-project.vercel.app/api/auth/callback/google`
7. Copy the Client ID and Client Secret

### GitHub OAuth

1. Go to [GitHub Developer Settings](https://github.com/settings/developers)
2. Click **New OAuth App**
3. Application name: `Kinto`
4. Homepage URL: `https://your-project.vercel.app`
5. Authorization callback URL: `https://your-project.vercel.app/api/auth/callback/github`
6. Copy the Client ID and Client Secret

### Email (Resend)

1. Go to [resend.com](https://resend.com) and create an account
2. Verify your domain or use the default `onboarding@resend.dev` for testing
3. Go to **API Keys → Create API Key**
4. Copy the key — this is your `RESEND_API_KEY`
5. Set `EMAIL_FROM` to your verified sender (e.g., `noreply@yourdomain.com`)

---

## Local Development

```bash
# Clone
git clone https://github.com/upendradevsingh/kinto.git
cd kinto

# Install dependencies
npm install

# Set up environment
cp .env.example .env.local
# Edit .env.local with your values

# Set up database
npx prisma migrate dev

# Start dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Architecture

```
Vercel (Next.js)
  ├── Frontend (React + shadcn/ui)
  ├── API Routes (Node.js serverless functions)
  ├── NextAuth (session management)
  └── Prisma Client
        │
        ▼
Supabase (PostgreSQL)
  ├── Users, Accounts, Sessions (NextAuth)
  ├── Projects (user's app projects)
  └── Messages (conversation history)
        
OpenAI API
  └── GPT-4o (conversation + code generation)
```

---

## Cost Estimate

| Component | Free Tier | Pro Tier |
|-----------|-----------|----------|
| Vercel | 100GB bandwidth, serverless functions | $20/mo |
| Supabase | 500MB database, 50K auth MAUs | $25/mo |
| OpenAI | Pay-per-use (~$0.50-2.00 per project generated) | Same |
| Resend | 3,000 emails/mo free | $20/mo |
| **Total** | **~$0 + OpenAI usage** | **~$65/mo + OpenAI** |

---

## Troubleshooting

**"NEXTAUTH_URL is not set"**
→ Set it in Vercel env vars to your deployment URL.

**"Invalid redirect_uri" on Google/GitHub login**
→ Make sure callback URLs in OAuth apps match your Vercel URL exactly.

**Database connection errors**
→ Check `DATABASE_URL` format. For Supabase, use the "Transaction" pooler string for serverless.

**Rate limit errors**
→ Free tier: 5 projects, 50 messages/day per user. Adjust in `src/lib/rate-limit.ts`.
