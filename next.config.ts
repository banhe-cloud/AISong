/** @type {import('next').NextConfig} */
import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  output: 'export',
  images: { unoptimized: true },
  // 核心修复：手动指定 Turbopack 根目录
  turbopack: {
    root: __dirname, // __dirname 代表当前配置文件所在目录（正确的项目根）
  },
  // 你原有的其他配置保留即可
  reactStrictMode: true,
}

export default nextConfig
