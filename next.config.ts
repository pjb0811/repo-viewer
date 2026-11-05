import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  images: {
    // GitHub avatar URLs end in `?v=4`; a pattern written as `new URL()` would
    // only allow an empty query.
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'avatars.githubusercontent.com',
        pathname: '/u/**',
        search: '?v=4',
      },
    ],
  },
};

export default nextConfig;
