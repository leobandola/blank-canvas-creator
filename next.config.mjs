/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    unoptimized: true,
  },
  typescript: {
    // Check types during build to catch errors
    ignoreBuildErrors: false,
  },
}

export default nextConfig
