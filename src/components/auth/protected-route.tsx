"use client";

import { useAuth } from "@/contexts/auth-context";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface ProtectedRouteProps {
	children: React.ReactNode;
	redirectTo?: string;
}

export function ProtectedRoute({
	children,
	redirectTo = "/login",
}: ProtectedRouteProps) {
	const { user, loading } = useAuth();
	const router = useRouter();
	const [mounted, setMounted] = useState(false);

	useEffect(() => {
		setMounted(true);
	}, []);

	// Allow bypassing auth locally for visual QA or when explicitly enabled
	const isLocalhost =
		typeof window !== "undefined" &&
		(window.location.hostname === "localhost" ||
			window.location.hostname === "127.0.0.1");
	const bypassAuth =
		process.env.NEXT_PUBLIC_BYPASS_AUTH === "true" ||
		(process.env.NODE_ENV !== "production" && isLocalhost);

	useEffect(() => {
		if (mounted && !bypassAuth && !loading && !user) {
			router.push(redirectTo);
		}
	}, [mounted, user, loading, router, redirectTo, bypassAuth]);

	if (!mounted) {
		return null;
	}

	if (loading && !bypassAuth) {
		return (
			<div className='flex items-center justify-center min-h-screen'>
				<div className='animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600'></div>
			</div>
		);
	}

	if (!bypassAuth && !user) {
		return null;
	}

	return <>{children}</>;
}
