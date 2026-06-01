'use client';

import { SessionProvider } from 'next-auth/react';

/**
 * Client-side session provider wrapper.
 * Wraps children with NextAuth SessionProvider for useSession hook access.
 */
export default function AuthProvider({ children }) {
  return <SessionProvider>{children}</SessionProvider>;
}
