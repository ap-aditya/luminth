import { composePlugins, withNx } from '@nx/next';
import type { WithNxOptions } from '@nx/next/plugins/with-nx';

/**
 * @type {WithNxOptions}
 **/
const nextConfig: WithNxOptions = {
  nx: {
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'api.dicebear.com',
        port: '',
        pathname: '/8.x/adventurer/svg/**',
      },
    ],
  },
  webpack(config) {
    // The existing rule that handles SVG imports
    const fileLoaderRule = config.module.rules.find((rule: any) =>
      rule.test?.test?.('.svg'),
    );

    config.module.rules.push(
      // Re-add the existing rule, but only for svg imports ending in ?url
      {
        ...fileLoaderRule,
        test: /\.svg$/i,
        resourceQuery: /url/, // *.svg?url
      },
      // Convert all other *.svg imports to React components
      {
        test: /\.svg$/i,
        issuer: fileLoaderRule.issuer,
        resourceQuery: { not: [...fileLoaderRule.resourceQuery.not, /url/] },
        use: ['@svgr/webpack'],
      },
    );

    // Modify the file loader rule to ignore other *.svg imports
    fileLoaderRule.exclude = /\.svg$/i;

    return config;
  },
};

const plugins = [
  // Add any Next.js plugins to this list if you have any.
  withNx,
];

export default composePlugins(...plugins)(nextConfig);
