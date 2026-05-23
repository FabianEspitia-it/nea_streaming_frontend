/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    NEXT_PUBLIC_BACKEND_API_URL: process.env.BACKEND_API_URL,
  },
};

export default nextConfig;
