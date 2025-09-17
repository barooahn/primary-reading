"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { User, Session } from "@supabase/supabase-js";
import { createClient } from "@/utils/supabase/client";

type AuthContextType = {
	user: User | null;
	session: Session | null;
	loading: boolean;
	signOut: () => Promise<void>;
	updateUserMetadata: (
		data: Record<string, unknown>
	) => Promise<{ ok: boolean; error?: string }>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
	const [user, setUser] = useState<User | null>(null);
	const [session, setSession] = useState<Session | null>(null);
	const [loading, setLoading] = useState(true);
	const supabase = createClient();

	useEffect(() => {
		const getSession = async () => {
			const {
				data: { session },
			} = await supabase.auth.getSession();
			setSession(session);
			setUser(session?.user ?? null);
			setLoading(false);
		};

		getSession();

		const {
			data: { subscription },
		} = supabase.auth.onAuthStateChange((_event, session) => {
			setSession(session);
			setUser(session?.user ?? null);
			setLoading(false);
		});

		return () => subscription.unsubscribe();
	}, [supabase.auth]);

	const signOut = async () => {
		const { error } = await supabase.auth.signOut();
		if (error) {
			console.error("Error signing out:", error.message);
		}
	};

	const updateUserMetadata = async (data: Record<string, unknown>) => {
		const { data: result, error } = await supabase.auth.updateUser({
			data,
		});
		if (error) {
			console.error("Error updating user:", error.message);
			return { ok: false, error: error.message };
		}
		if (result?.user) {
			setUser(result.user);
		}
		return { ok: true };
	};

	const value = {
		user,
		session,
		loading,
		signOut,
		updateUserMetadata,
	};

	return (
		<AuthContext.Provider value={value}>{children}</AuthContext.Provider>
	);
}

export const useAuth = () => {
	const context = useContext(AuthContext);
	if (context === undefined) {
		throw new Error("useAuth must be used within an AuthProvider");
	}
	return context;
};
