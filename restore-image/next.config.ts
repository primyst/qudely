/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    appDir: true, // ✅ Enables App Router
  },
  images: {
    domains: [
      "YOUR_SUPABASE_BUCKET_URL", // e.g., xyz.supabase.co
      "huggingface.co",           // for restored images from HuggingFace
      "hf.space",                  // sometimes spaces serve images from this domain
    ],
  },
};

module.exports = nextConfig;