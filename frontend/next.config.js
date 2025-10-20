/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  output: 'standalone',
  
  // Performance Optimierungen
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production' ? {
      exclude: ['error', 'warn'],
    } : false,
  },
  
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || '',
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
