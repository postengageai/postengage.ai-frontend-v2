/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    // C-1 FIX: was `true` — real type errors were silently hidden during builds.
    // With strict: true in tsconfig, keeping this false ensures the build fails
    // fast on real bugs rather than shipping broken code.
    ignoreBuildErrors: false,
  },
  images: {
    // C-2 FIX: was `unoptimized: true` — disabled WebP/AVIF, lazy loading, CDN
    // caching for ALL images. Enumerate every external image origin explicitly.
    remotePatterns: [
      // Instagram / Facebook CDN — profile photos, media thumbnails
      { protocol: 'https', hostname: '*.cdninstagram.com' },
      { protocol: 'https', hostname: '*.fbcdn.net' },
      { protocol: 'https', hostname: 'graph.facebook.com' },
      // Our own CDN / S3 bucket (update hostname to match your infra)
      { protocol: 'https', hostname: 'cdn.postengage.ai' },
      { protocol: 'https', hostname: '*.s3.amazonaws.com' },
      { protocol: 'https', hostname: '*.s3.*.amazonaws.com' },
      // Avatars / OAuth profile images (Google, GitHub, LinkedIn)
      { protocol: 'https', hostname: 'lh3.googleusercontent.com' },
      { protocol: 'https', hostname: 'avatars.githubusercontent.com' },
      { protocol: 'https', hostname: 'media.licdn.com' },
    ],
  },
  redirects: async () => [
    {
      source: '/',
      destination: '/dashboard',
      permanent: false,
    },
  ],
};

export default nextConfig;
