import type { NextConfig } from 'next'
import path from 'path'
import { fileURLToPath } from 'url'

const projectRoot = path.dirname(fileURLToPath(import.meta.url))

const nextConfig: NextConfig = {
  outputFileTracingRoot: projectRoot,
  async redirects() {
    return [
      { source: '/evidence', destination: '/research/photonic-age', permanent: true },
      { source: '/evidence/:path*', destination: '/research/photonic-age', permanent: true },
      { source: '/loss-in-light-years', destination: '/research/photonic-age', permanent: true },
      { source: '/loss-in-light-years/:path*', destination: '/research/photonic-age', permanent: true },
    ]
  },
}

export default nextConfig
