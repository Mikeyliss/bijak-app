/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: '25mb'
    },
    // Next.js 14's name for this option (renamed to the top-level
    // `serverExternalPackages` in Next.js 15+)
    serverComponentsExternalPackages: ['@napi-rs/canvas', 'pdfjs-dist']
  }
};

export default nextConfig;
