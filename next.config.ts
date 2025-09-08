import type { NextConfig } from "next";

const nextConfig: NextConfig = {
	eslint: {
		ignoreDuringBuilds: true,
	},
	typescript: {
		ignoreBuildErrors: true,
	},
	images: {
		// Allow signed Supabase Storage URLs
		domains: ["nvmcpuwrpdfkycijqvpw.supabase.co"],
		remotePatterns: [
			{
				protocol: "https",
				hostname: "nvmcpuwrpdfkycijqvpw.supabase.co",
				pathname: "/storage/v1/object/**",
			},
			// Optional: allow any Supabase project (useful across envs). Comment out if you prefer strict.
			// {
			//   protocol: "https",
			//   hostname: "*.supabase.co",
			//   pathname: "/storage/v1/object/**",
			// },
		],
	},
};

export default nextConfig;
