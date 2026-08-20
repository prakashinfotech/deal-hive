/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',

  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**.blob.core.windows.net', pathname: '/**' },
      { protocol: 'https', hostname: '**.cloudflare.com', pathname: '/**' },
      { protocol: 'https', hostname: 'images.unsplash.com', pathname: '/**' },
      { protocol: 'http', hostname: 'localhost', port: '5000', pathname: '/**' },
    ],
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },

  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:5000/api/v1',
    NEXT_PUBLIC_SIGNALR_URL: process.env.NEXT_PUBLIC_SIGNALR_URL ?? 'http://localhost:5000',
    NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? '',
  },

  reactStrictMode: true,

  experimental: {
    optimizePackageImports: ['lucide-react', '@radix-ui/react-dialog', '@radix-ui/react-tabs',
      '@radix-ui/react-dropdown-menu', '@radix-ui/react-select', 'framer-motion'],
  },

  async headers() {
    return [{
      source: '/(.*)',
      headers: [
        { key: 'X-Frame-Options', value: 'DENY' },
        { key: 'X-Content-Type-Options', value: 'nosniff' },
        { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
        { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
      ],
    }];
  },

  async redirects() {
    return [
      // Account shortcut
      { source: '/account', destination: '/account/orders', permanent: false },
      // Old auth routes → new Groupon-style routes
      { source: '/auth/login', destination: '/login', permanent: true },
      { source: '/auth/register', destination: '/signup', permanent: true },
      { source: '/auth/forgot-password', destination: '/login', permanent: false },
      // Old account routes → new routes
      { source: '/account/vouchers', destination: '/account/groupons', permanent: true },
      { source: '/wishlist', destination: '/account/wishlist', permanent: true },
      // Old deals category routes → Groupon-style routes
      { source: '/deals/local', destination: '/local', permanent: true },
      { source: '/deals/health-beauty', destination: '/local/beauty-and-spas', permanent: true },
      { source: '/deals/experiences', destination: '/local/things-to-do', permanent: true },
      { source: '/deals/food', destination: '/local/food-and-drink', permanent: true },
      { source: '/deals/auto-home', destination: '/local/automotive', permanent: true },
      { source: '/deals/travel', destination: '/travel', permanent: true },
      { source: '/deals/goods', destination: '/goods', permanent: true },
      { source: '/deals/gifts', destination: '/gift', permanent: true },
      // Old deals listing with query params
      { source: '/deals', destination: '/local', permanent: false },
      // Merchant → vendor portal
      { source: '/merchant', destination: '/vendor/register', permanent: false },
    ];
  },
};

export default nextConfig;
