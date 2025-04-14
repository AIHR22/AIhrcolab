/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ["avatars.githubusercontent.com", "images.unsplash.com"],
  },
  // Disable static optimization for all pages
  experimental: {
    // This ensures that all pages are rendered at request time
    // which helps with client-side hooks like useAPI and useAI
    appDir: true,
  },
}

module.exports = nextConfig

