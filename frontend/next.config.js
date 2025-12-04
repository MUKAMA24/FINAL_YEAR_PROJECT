/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['localhost'],
  },
  // Enable standalone output for better deployment
  output: process.env.NODE_ENV === 'production' ? 'standalone' : undefined,
  // Optimize production builds
  swcMinify: true,
  // Reduce build time
  productionBrowserSourceMaps: false,
}

module.exports = nextConfig
