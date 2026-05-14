/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb',
    },
  },

  allowedDevOrigins: ['192.168.56.1'],
}

export default nextConfig