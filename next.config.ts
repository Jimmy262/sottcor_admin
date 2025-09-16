import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Configuración optimizada para EasyPanel y Docker

  // Generar build standalone para Docker
  output: 'standalone',

  // Optimizaciones de imagen
  images: {
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },

  // Configuración experimental para mejor rendimiento
  experimental: {
    // Optimización de bundle
    optimizePackageImports: ['@prisma/client'],
  },

  // Configuración de headers de seguridad
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
        ],
      },
    ];
  },

  // Configuración de compresión
  compress: true,

  // Configuración para evitar problemas con ESLint en build
  eslint: {
    ignoreDuringBuilds: process.env.NODE_ENV === 'production',
  },

  // Configuración de TypeScript
  typescript: {
    ignoreBuildErrors: process.env.NODE_ENV === 'production',
  },
};

export default nextConfig;
