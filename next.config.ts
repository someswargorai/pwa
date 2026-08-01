import type { NextConfig } from "next";
import withPWAInit from "@ducanh2912/next-pwa";

const withPWA = withPWAInit({
  dest: "public",
  cacheOnFrontEndNav: true,
  aggressiveFrontEndNavCaching: true,
  register: true,
  disable: false,
  extendDefaultRuntimeCaching: true,
  workboxOptions: {
    exclude: [/.*/],
    runtimeCaching: [
      {
        urlPattern: /\/product\/.*/i,
        handler: "NetworkFirst",
        options: {
          cacheName: "product-pages",
          expiration: { maxEntries: 50 },
        },
      },
      {
        urlPattern: /^https:\/\/fakestoreapi\.com\/img\/.*/i,
        handler: "CacheFirst",
        options: {
          cacheName: "fakestore-cache",
          cacheableResponse: {
            statuses: [0, 200],
          },
        },
      },
    ],
  },
});

const nextConfig: NextConfig = {
  turbopack:{},
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "fakestoreapi.com"
      }
    ]
  },
};

export default withPWA(nextConfig);
