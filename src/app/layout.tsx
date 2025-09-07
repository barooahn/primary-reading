import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/contexts/auth-context";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { ConditionalHeader } from "@/components/navigation/conditional-header";

const inter = Inter({
	subsets: ["latin"],
	variable: "--font-inter",
});

export const metadata: Metadata = {
	title: "PrimaryReading - Fun Reading Adventures for Kids",
	description:
		"AI-powered reading platform that makes learning fun with exciting stories, games, and interactive questions for primary school children.",
	keywords: [
		"reading",
		"education",
		"children",
		"AI stories",
		"comprehension",
		"elementary school",
	],
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang='en' suppressHydrationWarning>
			<body
				className={`${inter.variable} font-sans antialiased min-h-screen bg-background text-foreground`}
			>
				<ThemeProvider>
					<AuthProvider>
						<div className='flex min-h-screen flex-col'>
							<ConditionalHeader />
							<main className='flex-1'>{children}</main>
						</div>
					</AuthProvider>
				</ThemeProvider>
			</body>
		</html>
	);
}
