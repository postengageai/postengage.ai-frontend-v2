/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
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
