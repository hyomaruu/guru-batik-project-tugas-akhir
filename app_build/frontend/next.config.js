/** @type {import('next').NextConfig} */
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
})

const nextConfig = {
  output: "standalone",
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**" },
      { protocol: "http", hostname: "**" },
    ],
  },
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${process.env.INTERNAL_API_URL || "http://localhost:8080/api/v1"}/:path*`,
      },
      {
        source: "/uploads/:path*",
        destination: `http://localhost:8080/uploads/:path*`,
      },
    ];
  },
};

module.exports = withBundleAnalyzer(nextConfig)
