import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'yphctvchjmceqpibrsqd.supabase.co',
        port: '',
        pathname: '/storage/v1/object/public/plant-images/**',
      },
    ],
  },
};

export default nextConfig;
