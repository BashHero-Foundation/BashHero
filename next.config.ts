import type { NextConfig } from "next";

const isScorm = process.env.NEXT_PUBLIC_SCORM === "true";

const nextConfig: NextConfig = {
  /* config options here */
  output: 'export',
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
  assetPrefix: isScorm ? './' : undefined,
};
export default nextConfig;
