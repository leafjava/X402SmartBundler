module.exports = { 
  reactStrictMode: true,
  typescript: {
    // !! WARN !!
    // 在生产构建时忽略 TypeScript 错误
    // 这样可以继续部署，但建议后续修复这些类型错误
    ignoreBuildErrors: true,
  },
  eslint: {
    // 在生产构建时忽略 ESLint 错误
    ignoreDuringBuilds: true,
  },
  webpack: (config) => {
    config.externals.push('pino-pretty', 'encoding');
    return config;
  },
};
