/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Next 16.3 expects typescript/bin/tsc, but the API bridge exposes tsc6.
  // Use the TS6 API here; the separate typecheck script gates on native TS7.
  experimental: { useTypeScriptCli: false },
  transpilePackages: ['bpmn-xyflow'],
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cdn-images-1.medium.com',
        pathname: '/**',
      },
    ],
  },
}

module.exports = nextConfig
