/** @type {import('next').NextConfig} */
const nextConfig = {
    async redirects() {
        return [{
            source: '/',
            destination: '/home',
            permanent: true,
        }, ];
    },
    experimental: {
        forceSwcTransforms: true,
    },
};

export default nextConfig;
