/** @type {import('next').NextConfig} */
const nextConfig = {
  // Allow images from Pexels and other external sources
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'images.pexels.com' },
      { protocol: 'https', hostname: 'videos.pexels.com' },
      { protocol: 'https', hostname: 'lh3.googleusercontent.com' },
      { protocol: 'https', hostname: 'avatars.githubusercontent.com' },
    ],
  },

  // Exclude server-only packages from client bundles
  serverExternalPackages: ['mongoose', 'bcryptjs'],

  // Enable experimental features
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb',
    },
  },
};

export default nextConfig;
