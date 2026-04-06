import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  images: {
    domains: ["images.unsplash.com", "img.freepik.com", "img.com"],
  },
};

export default nextConfig;