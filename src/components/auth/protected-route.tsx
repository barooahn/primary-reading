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

	// Only allow bypassing auth when explicitly enabled via environment variable
	const bypassAuth = process.env.NEXT_PUBLIC_BYPASS_AUTH === "true";

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
