import { createMDX } from 'fumadocs-mdx/next';

const withMDX = createMDX();

/** @type {import('next').NextConfig} */
const config = {
  output: 'export',
  reactStrictMode: true,
  images: {
    domains: ['refref.ai'],
    unoptimized: true
  }
};

export default withMDX(config);
