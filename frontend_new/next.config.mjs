/** @type {import('next').NextConfig} */
const nextConfig = {
  // The website forwards every request that starts with /api to the
  // Python backend on this laptop. This way the browser only ever talks
  // to the website, so a shared link works on a teammate's computer too.
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: "http://127.0.0.1:8000/:path*",
      },
    ];
  },

  // Allow the site to be opened through a Cloudflare tunnel link
  allowedDevOrigins: ["*.trycloudflare.com"],

  experimental: {
    // Local AI can take a few minutes on an upload; don't cut it off
    proxyTimeout: 300000,
  },
};

export default nextConfig;
