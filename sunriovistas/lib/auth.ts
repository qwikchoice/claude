import { NextAuthOptions, getServerSession } from 'next-auth'
import { PrismaAdapter } from '@auth/prisma-adapter'
import GoogleProvider from 'next-auth/providers/google'
import FacebookProvider from 'next-auth/providers/facebook'
import { UserRole } from '@prisma/client'
import prisma from './prisma'
import type { Session } from 'next-auth'

// Extend next-auth types to include role
declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      name?: string | null
      email?: string | null
      image?: string | null
      role: UserRole
    }
  }

  interface User {
    role?: UserRole
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id?: string
    role?: UserRole
  }
}

export const authOptions: NextAuthOptions = {
  // @ts-expect-error — PrismaAdapter type mismatch between @auth/prisma-adapter and next-auth v4
  adapter: PrismaAdapter(prisma),

  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          prompt: 'consent',
          access_type: 'offline',
          response_type: 'code',
        },
      },
    }),

    FacebookProvider({
      clientId: process.env.FACEBOOK_CLIENT_ID!,
      clientSecret: process.env.FACEBOOK_CLIENT_SECRET!,
    }),

    // Apple OAuth — requires additional setup:
    // 1. Apple Developer account with Sign in with Apple enabled
    // 2. A service ID, team ID, and private key (P8 format)
    // 3. Install: npm install next-auth (already included)
    // To enable, uncomment and configure:
    // AppleProvider({
    //   clientId: process.env.APPLE_CLIENT_ID!,
    //   clientSecret: process.env.APPLE_CLIENT_SECRET!, // JWT signed with private key
    // }),
  ],

  session: {
    strategy: 'jwt',
  },

  pages: {
    signIn: '/login',
    error: '/login',
  },

  callbacks: {
    async jwt({ token, user }) {
      // On initial sign-in, `user` is populated
      if (user) {
        token.id = user.id
        token.role = user.role ?? UserRole.CUSTOMER
      }

      // If role is missing (e.g. after DB update), re-fetch from DB
      if (token.id && !token.role) {
        const dbUser = await prisma.user.findUnique({
          where: { id: token.id },
          select: { role: true },
        })
        token.role = dbUser?.role ?? UserRole.CUSTOMER
      }

      return token
    },

    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string
        session.user.role = (token.role as UserRole) ?? UserRole.CUSTOMER
      }
      return session
    },
  },

  secret: process.env.NEXTAUTH_SECRET,

  debug: process.env.NODE_ENV === 'development',
}

/**
 * Returns the current server-side session, or null if unauthenticated.
 * Use in Server Components and Route Handlers.
 */
export async function getServerAuthSession(): Promise<Session | null> {
  return getServerSession(authOptions)
}

/**
 * Returns true if the session belongs to an admin user.
 */
export function isAdmin(session: Session | null): boolean {
  return session?.user?.role === UserRole.ADMIN
}
