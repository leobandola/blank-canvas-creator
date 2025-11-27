/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    unoptimized: true,
  },
  eslint: {
    // Only ignore during development, not production
    ignoreDuringBuilds: false,
  },
  typescript: {
    // Check types during build to catch errors
    ignoreBuildErrors: false,
  },
}

export default nextConfig
