import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  // https://nextjs.org/docs/app/api-reference/next-config-js/serverExternalPackages
  serverExternalPackages: ['sharp', 'onnxruntime-node'],
};

export default nextConfig;