import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  images: {
    remotePatterns: [new URL('https://avatars.githubusercontent.com/**')],
  },
};

export default nextConfig;
