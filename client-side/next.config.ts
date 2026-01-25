import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "http", hostname: "localhost", port: "8000", pathname: "/storage/**" },
      { protocol: "http", hostname: "127.0.0.1", port: "8000", pathname: "/storage/**" },
      // fallback for custom domains (only for /storage/*)
      { protocol: "http", hostname: "**", pathname: "/storage/**" },
      { protocol: "https", hostname: "**", pathname: "/storage/**" },
    ],
  },
};

export default nextConfig;


// import type { NextConfig } from "next";

// const nextConfig: NextConfig = {
//   images: {
//     remotePatterns: [
//       {
//         protocol: 'http',
//         hostname: 'localhost',
//       },
//       {
//         protocol: 'http',
//         hostname: '127.0.0.1',
//       }
//     ],
//   },
// };

// export default nextConfig;