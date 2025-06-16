/** @type {import('next').NextConfig} */
const nextConfig = {
    output: "standalone",
    async rewrites() {
        return [
        {
            source: '/api/:path*',
            destination: 'http://localhost:5000/api/:path*' // Proxy to Backend
        }
        ]
    },
    httpAgentOptions: {
        keepAlive: false,
    },
};

export default nextConfig;
