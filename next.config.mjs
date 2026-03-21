/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    // C-1 FIX: was `true` — real type errors were silently hidden during builds.
    // With strict: true in tsconfig, keeping this false ensures the build fails
    // fast on real bugs rather than shipping broken code.
    ignoreBuildErrors: false,
  },
  images: {
    remotePatterns: [
      // ── Instagram / Facebook CDN ─────────────────────────────────────
      // Instagram CDN — scontent-*.cdninstagram.com, scontent.*.instagram.com
      { protocol: 'https', hostname: '*.cdninstagram.com' },
      { protocol: 'https', hostname: '*.fbcdn.net' },
      { protocol: 'https', hostname: 'graph.facebook.com' },
      { protocol: 'https', hostname: '*.instagram.com' },

      // ── Twitter / X ─────────────────────────────────────────────────
      { protocol: 'https', hostname: 'pbs.twimg.com' },
      { protocol: 'https', hostname: 'abs.twimg.com' },

      // ── LinkedIn ─────────────────────────────────────────────────────
      { protocol: 'https', hostname: 'media.licdn.com' },
      { protocol: 'https', hostname: 'media-exp1.licdn.com' },
      { protocol: 'https', hostname: '*.licdn.com' },

      // ── YouTube ─────────────────────────────────────────────────────
      { protocol: 'https', hostname: 'i.ytimg.com' },
      { protocol: 'https', hostname: 'yt3.ggpht.com' },
      { protocol: 'https', hostname: 'yt3.googleusercontent.com' },

      // ── TikTok ─────────────────────────────────────────────────────
      { protocol: 'https', hostname: '*.tiktokcdn.com' },
      { protocol: 'https', hostname: 'p16-sign-va.tiktokcdn.com' },

      // ── Pinterest ───────────────────────────────────────────────────
      { protocol: 'https', hostname: 'i.pinimg.com' },

      // ── PostEngage CDN / S3 ──────────────────────────────────────────
      { protocol: 'https', hostname: 'cdn.postengage.ai' },
      { protocol: 'https', hostname: 'media.postengage.ai' },
      // MinIO object storage -- user-uploaded media (social profile avatars, brand assets).
      // Without this entry the Next.js Image component refuses to optimise the URL.
      { protocol: 'https', hostname: 'minio.postengage.ai' },
      { protocol: 'https', hostname: '*.s3.amazonaws.com' },
      { protocol: 'https', hostname: '*.s3.*.amazonaws.com' },
      { protocol: 'https', hostname: 'storage.googleapis.com' },
      { protocol: 'https', hostname: '*.cloudfront.net' },

      // ── OAuth profile images ─────────────────────────────────────────
      { protocol: 'https', hostname: 'lh3.googleusercontent.com' },
      { protocol: 'https', hostname: 'avatars.githubusercontent.com' },

      // ── Local development backend ─────────────────────────────────────
      // Allows loading images served by the local backend during dev
      { protocol: 'http', hostname: 'localhost' },
      { protocol: 'http', hostname: '127.0.0.1' },
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
