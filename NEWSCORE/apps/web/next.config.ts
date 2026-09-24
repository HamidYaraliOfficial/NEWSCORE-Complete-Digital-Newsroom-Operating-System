import type { NextConfig } from 'next';
const nextConfig: NextConfig = {reactStrictMode:true,images:{remotePatterns:[{protocol:'http',hostname:'localhost'},{protocol:'https',hostname:'*'}]},experimental:{typedRoutes:true}};
export default nextConfig;
