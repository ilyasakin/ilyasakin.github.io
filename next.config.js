/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    // Enable static generation for dynamic routes
    staticPageGenerationTimeout: 120,
  },
}

module.exports = nextConfig
