import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "via.placeholder.com",
      },
      {
        protocol: "https",
        hostname: "*.supabase.co", // برای وقتی که بخوای از Supabase Storage عکس بیاری
      },
    ],
  },
};

export default nextConfig;
