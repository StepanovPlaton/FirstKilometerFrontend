import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // eslint-disable-next-line @typescript-eslint/require-await
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination:
          `${process.env.BACKEND_PROTOCOL}://` +
          `${process.env.BACKEND_DOMAIN}:${process.env.BACKEND_PORT}/api/:path*/`,
      },
    ];
  },
  images: {
    remotePatterns: [
      new URL(
        `${process.env.BACKEND_PROTOCOL}://` +
          `${process.env.BACKEND_DOMAIN}:${process.env.BACKEND_PORT}/**`
      ),
    ],
  },
};

export default nextConfig;
