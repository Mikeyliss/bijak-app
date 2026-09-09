/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: '25mb'
    },
    serverComponentsExternalPackages: ['@napi-rs/canvas', 'pdfjs-dist'],
    // pdfjs-dist loads its worker file dynamically at runtime, so Vercel's
    // automatic file tracing misses it -- force-include it here.
    outputFileTracingIncludes: {
      '/api/generate': ['./node_modules/pdfjs-dist/legacy/build/**']
    }
  }
};

export default nextConfig;
