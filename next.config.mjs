/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: '25mb'
    }
  },
  // @napi-rs/canvas and pdfjs-dist ship native/binary bits that shouldn't be bundled
  serverExternalPackages: ['@napi-rs/canvas', 'pdfjs-dist']
};

export default nextConfig;
