import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  serverExternalPackages: ['playwright', 'playwright-core', '@sparticuz/chromium'],
  outputFileTracingIncludes: {
    '/api/reports/[id]/pdf': ['./node_modules/@sparticuz/chromium/bin/**/*'],
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
      },
    ],
  },
}

export default nextConfig
