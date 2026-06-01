/**
 * Next.js Middleware
 * Protects /dashboard/* and /processing/* routes behind authentication.
 */
export { default } from 'next-auth/middleware';

export const config = {
  matcher: ['/dashboard/:path*', '/processing/:path*'],
};
