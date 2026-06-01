/**
 * NextAuth.js Configuration
 * Providers: Google OAuth, GitHub OAuth (later), Email/Password
 */
import NextAuth from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import { connectDB } from '@/server/lib/mongodb';
import User from '@/server/models/User';

const handler = NextAuth({
  providers: [
    // Google OAuth
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
    }),

    // Email/Password
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Email and password are required');
        }

        await connectDB();

        // Find user and include passwordHash
        const user = await User.findOne({ email: credentials.email }).select('+passwordHash');

        if (!user) {
          throw new Error('No account found with this email');
        }

        if (!user.passwordHash) {
          throw new Error('This account uses social login. Please sign in with Google.');
        }

        const isValid = await bcrypt.compare(credentials.password, user.passwordHash);
        if (!isValid) {
          throw new Error('Invalid password');
        }

        return {
          id: user._id.toString(),
          email: user.email,
          name: user.name,
          image: user.image,
        };
      },
    }),
  ],

  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 3600, // 30 days
  },

  pages: {
    signIn: '/login',
    signUp: '/signup',
    error: '/login',
  },

  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === 'google') {
        await connectDB();

        // Upsert user on Google sign-in
        const existing = await User.findOne({ email: user.email });
        if (!existing) {
          await User.create({
            email: user.email,
            name: user.name || '',
            image: user.image || '',
            provider: 'google',
            providerId: account.providerAccountId,
            tier: 'free',
            credits: 1,
          });
        }
      }
      return true;
    },

    async jwt({ token, user }) {
      if (user) {
        await connectDB();
        const dbUser = await User.findOne({ email: user.email || token.email });
        if (dbUser) {
          token.userId = dbUser._id.toString();
          token.tier = dbUser.tier;
          token.credits = dbUser.credits;
          token.creditsUsed = dbUser.creditsUsed;
        }
      }
      return token;
    },

    async session({ session, token }) {
      if (token) {
        session.user.id = token.userId;
        session.user.tier = token.tier;
        session.user.credits = token.credits;
        session.user.creditsUsed = token.creditsUsed;
      }
      return session;
    },
  },

  secret: process.env.NEXTAUTH_SECRET,
});

export { handler as GET, handler as POST };
