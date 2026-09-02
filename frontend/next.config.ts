import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export',
  // Ensure trailing slashes are generated for static hosting (optional but recommended for exports)
  trailingSlash: true,
};

export default nextConfig;
