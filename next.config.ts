import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  output: 'export',
  assetPrefix: './',
  trailingSlash: true,
  skipTrailingSlashRedirect: true,
};

export default nextConfig;
