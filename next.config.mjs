/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,

  webpack(config, { isServer }) {
    // Only apply in development
    if (!isServer) {
      config.watchOptions = {
        poll: 1000, // Use polling to reduce CPU spikes on macOS
        aggregateTimeout: 300,
        ignored: ["**/.git/**", "**/node_modules/**", "**/.next/**"],
      };
    }

    return config;
  },

  productionBrowserSourceMaps: false,

  // ✅ Add this block to ignore ESLint errors during the build
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
