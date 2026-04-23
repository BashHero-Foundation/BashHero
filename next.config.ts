import type { NextConfig } from "next";

const currentlyStaticallyBuilding = process.env.BUILDING_SCORM === 'true';

const nextConfig: NextConfig = {
  /* config options here */
  output: 'export',
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
  ...(currentlyStaticallyBuilding && {assetPrefix: './'})
};
export default nextConfig;
