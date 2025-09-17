import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/contexts/auth-context";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { ConditionalHeader } from "@/components/navigation/conditional-header";
import ErrorBoundary from "@/components/error/error-boundary";

// Child-friendly fonts are imported in globals.css via Google Fonts URL
// This provides better control over font loading and fallbacks for educational content

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
			<head />
			<body
				className="antialiased min-h-screen bg-background text-foreground"
				style={{fontFamily: "var(--font-primary)"}}
			>
				{/* Skip Navigation Link for Accessibility */}
				<a
					href="#main-content"
					className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-primary focus:text-white focus:rounded-md focus:shadow-lg focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
				>
					Skip to main content
				</a>

				<ErrorBoundary showDetails={process.env.NODE_ENV === 'development'}>
					<ThemeProvider>
						<AuthProvider>
							<div className='flex min-h-screen flex-col'>
								<ConditionalHeader />
								<main className='flex-1' id="main-content">{children}</main>
							</div>
						</AuthProvider>
					</ThemeProvider>
				</ErrorBoundary>
			</body>
		</html>
	);
}
