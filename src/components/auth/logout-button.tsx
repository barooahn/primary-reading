"use client";

import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/auth-context";
import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";

export function LogoutButton() {
	const { signOut } = useAuth();
	const router = useRouter();

	const handleSignOut = async () => {
		await signOut();
		router.push("/");
	};

	return (
		<Button
			variant='outline'
			size='sm'
			onClick={handleSignOut}
			className='flex items-center gap-2 shrink-0'
		>
			<LogOut className='h-4 w-4' />
			Sign out
		</Button>
	);
}
