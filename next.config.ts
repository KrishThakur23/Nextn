
import type {NextConfig} from 'next';
import withPWA from '@ducanh2912/next-pwa';
/** @type {import('next').NextConfig} */


const pwaConfig = withPWA({
  dest: 'public',
  register: true,
  disable: process.env.NODE_ENV === 'development',
});

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default pwaConfig(nextConfig);
