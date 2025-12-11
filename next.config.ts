import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'v5.airtableusercontent.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'i.imgur.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'i.ibb.co',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'uploadcarimages.sgp1.digitaloceanspaces.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
  // @ts-expect-error: Suppress type error for eslint config
  eslint: {
    ignoreDuringBuilds: true,
  },
  env: {
    JWT_SECRET: process.env.JWT_SECRET, // ⬅️ هذا المطلوب للميدل وير
  },
};

export default nextConfig;
