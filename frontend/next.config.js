/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  output: 'standalone',
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000',
  },
  // Cross-Origin Request Warning beheben
  devIndicators: {
    buildActivityPosition: 'bottom-right',
  },
  // Erlaubte Dev Origins für NAS und lokale Entwicklung
  experimental: {
    allowedDevOrigins: [
      'nas-timgreen01',
      'nas-timgreen01.local',
      'localhost',
      '*.local'
    ]
  }
}

module.exports = nextConfig
