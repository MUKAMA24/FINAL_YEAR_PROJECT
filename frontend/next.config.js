/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['localhost'],
  },
  // Optimize production builds
  swcMinify: true,
  // Reduce build time
  productionBrowserSourceMaps: false,
}

module.exports = nextConfig
