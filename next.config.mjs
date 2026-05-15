/** @type {import('next').NextConfig} */
const config = {
  output: 'standalone',
  transpilePackages: ['@react-pdf/renderer'],
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cdn.sanity.io',
        pathname: '/images/**',
      },
    ],
  },
  async redirects() {
    return [
      { source: '/business-ideas/services',      destination: '/business-ideas/local-services', permanent: true },
      { source: '/business-ideas/under-50k',     destination: '/business-ideas/under-1-lakh',   permanent: true },
      { source: '/business-ideas/for-women',     destination: '/business-ideas/for-beginners',  permanent: true },
      { source: '/business-ideas/agritech',      destination: '/business-ideas',                permanent: true },
      { source: '/business-ideas/manufacturing', destination: '/business-ideas',                permanent: true },
    ]
  },
}

export default config
