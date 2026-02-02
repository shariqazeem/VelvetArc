/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config) => {
    config.externals.push("pino-pretty", "lokijs", "encoding");
    // Fix MetaMask SDK React Native warning
    config.resolve.fallback = {
      ...config.resolve.fallback,
      "@react-native-async-storage/async-storage": false,
    };
    return config;
  },
  transpilePackages: ["three"],
  // Suppress noisy warnings
  logging: {
    fetches: {
      fullUrl: false,
    },
  },
};

export default nextConfig;
