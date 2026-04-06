/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    return [
      { source: "/dashboard", destination: "/", permanent: true },
      { source: "/dashboard/:path*", destination: "/", permanent: true },
    ];
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  // Prisma & DB drivers must stay in Node, not Edge / Turbopack client graph
  serverExternalPackages: [
    "@prisma/client",
    "prisma",
    "@prisma/adapter-pg",
    "pg",
    "@prisma/adapter-pg",
  ],
};

export default nextConfig;
