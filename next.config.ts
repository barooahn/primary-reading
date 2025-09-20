import type { NextConfig } from "next";

const nextConfig: NextConfig = {
	// Enable strict error checking for production builds
	eslint: {
		ignoreDuringBuilds: false, // Enable ESLint during builds
		dirs: ['src'], // Only check src directory for faster builds
	},
	typescript: {
		ignoreBuildErrors: false, // Enable TypeScript error checking
	},

	// Optimize images for better performance
	images: {
		// Remove deprecated domains, use remotePatterns only
		remotePatterns: [
			{
				protocol: "https",
				hostname: "nvmcpuwrpdfkycijqvpw.supabase.co",
				pathname: "/storage/v1/object/**",
			},
			// Allow OpenAI generated images
			{
				protocol: "https",
				hostname: "oaidalleapiprodscus.blob.core.windows.net",
				pathname: "/**",
			},
		],
		// Enable modern image formats for better performance
		formats: ['image/webp', 'image/avif'],
		// Add image optimization settings
		minimumCacheTTL: 60 * 60 * 24 * 30, // Cache images for 30 days
		dangerouslyAllowSVG: false, // Security: disable SVG for user uploads
		contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
	},

	// Performance optimizations
	experimental: {
		// Optimize CSS loading - disabled due to missing critters dependency
		// optimizeCss: true,
	},

	// Turbopack configuration (replaces experimental.turbo)
	turbopack: {
		rules: {
			'*.svg': {
				loaders: ['@svgr/webpack'],
				as: '*.js',
			},
		},
	},

	// React strict mode is enabled by default in Next.js 15
	reactStrictMode: true,

	// Compiler optimizations
	compiler: {
		// Remove console.log in production
		removeConsole: process.env.NODE_ENV === 'production' ? {
			exclude: ['error', 'warn'], // Keep error and warn logs
		} : false,
	},

	// Security headers
	async headers() {
		return [
			{
				source: '/(.*)',
				headers: [
					{
						key: 'X-Frame-Options',
						value: 'DENY',
					},
					{
						key: 'X-Content-Type-Options',
						value: 'nosniff',
					},
					{
						key: 'Referrer-Policy',
						value: 'strict-origin-when-cross-origin',
					},
					{
						key: 'Permissions-Policy',
						value: 'geolocation=(), microphone=(), camera=()',
					},
				],
			},
		];
	},

	// Bundle analyzer for optimization
	...(process.env.ANALYZE === 'true' && {
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		webpack: (config: any) => {
			// eslint-disable-next-line @typescript-eslint/no-require-imports
			const BundleAnalyzer = require('@next/bundle-analyzer')({
				enabled: true,
			});
			config.plugins?.push(new BundleAnalyzer());
			return config;
		},
	}),
};

export default nextConfig;
