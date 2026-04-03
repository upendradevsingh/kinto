import NextAuth, { type NextAuthOptions } from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'
import GitHubProvider from 'next-auth/providers/github'
import EmailProvider from 'next-auth/providers/email'
import { PrismaAdapter } from '@next-auth/prisma-adapter'
import { prisma } from '@/lib/db'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    GitHubProvider({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    }),
    EmailProvider({
      from: process.env.EMAIL_FROM ?? 'noreply@kinto.app',
      sendVerificationRequest: async ({ identifier: email, url }) => {
        await resend.emails.send({
          from: process.env.EMAIL_FROM ?? 'noreply@kinto.app',
          to: email,
          subject: 'Sign in to Kinto',
          html: `
            <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; padding: 40px 24px;">
              <h2 style="margin: 0 0 16px;">Sign in to Kinto</h2>
              <p style="color: #666; margin: 0 0 24px;">Click the button below to sign in. This link expires in 24 hours.</p>
              <a href="${url}" style="display: inline-block; background: #000; color: #fff; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: 500;">Sign in</a>
              <p style="color: #999; font-size: 12px; margin: 24px 0 0;">If you didn't request this, you can safely ignore this email.</p>
            </div>
          `,
        })
      },
    }),
  ],
  session: {
    strategy: 'database',
  },
  pages: {
    signIn: '/auth/signin',
  },
  callbacks: {
    session({ session, user }) {
      if (session.user) {
        session.user.id = user.id
      }
      return session
    },
  },
}

export default NextAuth(authOptions)
