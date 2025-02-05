import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  serverExternalPackages: ['sharp', 'onnxruntime-node'],
  webpack: (config) => {
    config.externals = [...config.externals, { canvas: "canvas" }]; 
    return config;
  },
};

export default nextConfig;