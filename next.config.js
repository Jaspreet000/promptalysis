/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config) => {
    config.experiments = {
      ...config.experiments,
      topLevelAwait: true,
    };
    config.resolve.fallback = {
      net: false,
      tls: false,
      dns: false,
      child_process: false,
      fs: false,
      aws4: false,
      kerberos: false,
      "mongodb-client-encryption": false,
      "@mongodb-js/zstd": false,
      snappy: false,
      socks: false,
      "aws-crt": false,
      "gcp-metadata": false,
      "timers/promises": false,
      "@aws-sdk/credential-providers": false,
    };
    return config;
  },
};

module.exports = nextConfig;
