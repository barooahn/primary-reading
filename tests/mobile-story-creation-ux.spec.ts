import { test, expect, devices } from "@playwright/test";
import { CreateStoryPage } from "./pages/CreateStoryPage";

// Configure test to use mobile viewport
test.use({
	...devices["iPhone 12"],
	// Additional mobile-specific settings
	hasTouch: true,
	isMobile: true,
	baseURL: "http://localhost:3000",
});

// Mobile-focused test for story creation UX analysis
test.describe("Mobile Story Creation UX Analysis", () => {
	test("analyze mobile story creation flow UX issues", async ({ page }) => {
		// Enable console logging to capture any mobile-specific errors
		page.on("console", (msg) => console.log("PAGE LOG:", msg.text()));
		page.on("pageerror", (err) =>
			console.log("PAGE ERROR:", err.message)
		);

		console.log("🔍 Starting mobile UX analysis for story creation...");

		// Step 1: Navigate to login page and authenticate
		console.log("📱 Step 1: Logging in...");
		await page.goto("/login");

		// Take screenshot of login page on mobile
		await page.screenshot({
			path: "mobile-screenshots/01-login-page.png",
			fullPage: true,
		});

		// Login with provided credentials
		await page.fill('input[type="email"]', "barooahn@gmail.com");
		await page.fill('input[type="password"]', "g2442Y2L-17");
		await page.click('button[type="submit"]');

		// Wait for successful login redirect
		await page.waitForURL("/", { timeout: 10000 });
		console.log("✅ Login successful");

		// Step 2: Navigate to create story page
		console.log("📱 Step 2: Navigating to story creation...");
		await page.goto("/create");

		// Wait for page to fully load
		await page.waitForLoadState("networkidle");

		// Take screenshot of initial create page on mobile
		await page.screenshot({
			path: "mobile-screenshots/02-create-page-initial.png",
			fullPage: true,
		});

		const createStoryPage = new CreateStoryPage(page);

		// Verify page loads correctly on mobile
		await expect(createStoryPage.pageTitle).toBeVisible();

		// Step 3: Test year level selection on mobile
		console.log("📱 Step 3: Testing year level selection UX...");

		// Check if year level buttons are properly sized for mobile
		const yearButtons = await page
			.locator('[data-testid^="year-"][data-testid$="-selector"]')
			.all();
		console.log(`Found ${yearButtons.length} year level buttons`);

		for (let i = 0; i < yearButtons.length; i++) {
			const button = yearButtons[i];
			const boundingBox = await button.boundingBox();
			if (boundingBox) {
				console.log(
					`Year button ${i + 1}: ${boundingBox.width}x${
						boundingBox.height
					} at (${boundingBox.x}, ${boundingBox.y})`
				);

				// Check if buttons are large enough for mobile touch (minimum 44px recommended)
				if (boundingBox.height < 44) {
					console.log(
						`⚠️  Year button ${i + 1} too small for mobile: ${
							boundingBox.height
						}px height`
					);
				}
			}
		}

		// Select Year 3 and take screenshot
		await createStoryPage.selectYearLevel(3);
		await page.screenshot({
			path: "mobile-screenshots/03-year-level-selected.png",
			fullPage: true,
		});

		// Step 4: Test theme selection on mobile
		console.log("📱 Step 4: Testing theme selection UX...");

		// Check theme button layout and sizing
		const themeButtons = await page
			.locator('[data-testid="theme-button"]')
			.or(page.locator('button:has-text("🔍 Mystery Detective")'))
			.all();
		console.log(`Found ${themeButtons.length} theme buttons`);

		// Test scrolling behavior with themes
		await page.evaluate(() => {
			window.scrollTo(0, document.body.scrollHeight / 2);
		});

		// Select a theme and check mobile interaction
		const mysteryTheme = page.locator(
			'button:has-text("🔍 Mystery Detective")'
		);
		if ((await mysteryTheme.count()) > 0) {
			// Check if theme button is properly sized
			const themeBox = await mysteryTheme.boundingBox();
			if (themeBox) {
				console.log(
					`Mystery theme button: ${themeBox.width}x${themeBox.height}`
				);
			}

			await mysteryTheme.click();
			await page.screenshot({
				path: "mobile-screenshots/04-theme-selected.png",
				fullPage: true,
			});
		} else {
			// Fallback to first available theme
			console.log(
				"Mystery theme not found, selecting first available theme"
			);
			const firstTheme = await page
				.locator("button")
				.filter({ hasText: /🐱|🏠|🎨|🦆/ })
				.first();
			if ((await firstTheme.count()) > 0) {
				await firstTheme.click();
				await page.screenshot({
					path: "mobile-screenshots/04-theme-selected-fallback.png",
					fullPage: true,
				});
			}
		}

		// Step 5: Test story details/settings on mobile
		console.log("📱 Step 5: Testing story details UX...");

		// Wait for navigation to details step
		await page.waitForTimeout(1000);
		await page.screenshot({
			path: "mobile-screenshots/05-story-details.png",
			fullPage: true,
		});

		// Test story type selection buttons
		const fictionButton = page
			.locator('[data-testid="story-type-fiction"]')
			.or(page.locator('button:has-text("Fiction")'));
		// const nonFictionButton = page
		// 	.locator('[data-testid="story-type-non_fiction"]')
		// 	.or(page.locator('button:has-text("Non-Fiction")'));

		// Check if story type buttons are visible and properly sized
		if ((await fictionButton.count()) > 0) {
			const fictionBox = await fictionButton.boundingBox();
			if (fictionBox) {
				console.log(
					`Fiction button: ${fictionBox.width}x${fictionBox.height}`
				);
			}
			await fictionButton.click();
		}

		await page.screenshot({
			path: "mobile-screenshots/06-story-type-selected.png",
			fullPage: true,
		});

		// Step 6: Test generation button and mobile UX
		console.log("📱 Step 6: Testing generate story button...");

		const generateButton = page
			.locator('[data-testid="generate-story-btn"]')
			.or(page.locator('button:has-text("Create My Story")'));

		// Scroll to make sure generate button is visible
		await generateButton.scrollIntoViewIfNeeded();

		// Check if generate button is properly positioned and sized
		const generateBox = await generateButton.boundingBox();
		if (generateBox) {
			console.log(
				`Generate button: ${generateBox.width}x${generateBox.height}`
			);

			// Check if button is too close to bottom edge (potential mobile viewport issue)
			const viewportHeight = page.viewportSize()?.height || 0;
			const distanceFromBottom =
				viewportHeight - (generateBox.y + generateBox.height);
			console.log(
				`Distance from bottom of viewport: ${distanceFromBottom}px`
			);

			if (distanceFromBottom < 20) {
				console.log(
					"⚠️  Generate button too close to bottom edge on mobile"
				);
			}
		}

		await page.screenshot({
			path: "mobile-screenshots/07-before-generate.png",
			fullPage: true,
		});

		// Test the generation flow (but don't wait for completion to save time)
		if ((await generateButton.count()) > 0) {
			await generateButton.click();

			// Wait for generation screen to appear
			await page.waitForTimeout(2000);
			await page.screenshot({
				path: "mobile-screenshots/08-generation-started.png",
				fullPage: true,
			});

			// Check for mobile-specific generation UI issues
			// const progressBar = page.locator(".bg-primary.h-2.rounded-full");
			const loadingSpinner = page.locator(".animate-spin");

			await expect(loadingSpinner).toBeVisible();
			console.log("✅ Generation UI appears correctly on mobile");
		}

		// Step 7: Analyze mobile-specific issues found
		console.log("📱 Step 7: Mobile UX analysis complete");

		// Get final viewport and document dimensions
		const viewport = page.viewportSize();
		const documentSize = await page.evaluate(() => ({
			width: document.documentElement.scrollWidth,
			height: document.documentElement.scrollHeight,
		}));

		console.log("📊 Mobile UX Analysis Results:");
		console.log(`Viewport: ${viewport?.width}x${viewport?.height}`);
		console.log(`Document: ${documentSize.width}x${documentSize.height}`);
		console.log("Screenshots saved to mobile-screenshots/ directory");

		// Final screenshot of current state
		await page.screenshot({
			path: "mobile-screenshots/09-final-state.png",
			fullPage: true,
		});
	});

	test("test mobile story creation with custom prompt", async ({ page }) => {
		console.log("📱 Testing custom prompt flow on mobile...");

		// Login first
		await page.goto("/login");
		await page.fill('input[type="email"]', "barooahn@gmail.com");
		await page.fill('input[type="password"]', "g2442Y2L-17");
		await page.click('button[type="submit"]');
		await page.waitForURL("/", { timeout: 10000 });

		// Go to create page
		await page.goto("/create");
		await page.waitForLoadState("networkidle");

		const createStoryPage = new CreateStoryPage(page);

		// Select year level
		await createStoryPage.selectYearLevel(4);

		// Switch to custom prompt mode
		const customPromptTab = page.locator(
			'button:has-text("Custom Idea")'
		);
		if ((await customPromptTab.count()) > 0) {
			await customPromptTab.click();

			await page.screenshot({
				path: "mobile-screenshots/custom-01-tab-switched.png",
				fullPage: true,
			});

			// Test custom prompt textarea on mobile
			const textarea = page
				.locator('textarea[placeholder*="story idea"]')
				.or(page.locator("textarea"));
			if ((await textarea.count()) > 0) {
				// Check textarea sizing on mobile
				const textareaBox = await textarea.boundingBox();
				if (textareaBox) {
					console.log(
						`Custom prompt textarea: ${textareaBox.width}x${textareaBox.height}`
					);
				}

				const customPrompt =
					"A story about a young inventor who creates a robot companion that helps kids learn to read by turning books into interactive adventures";
				await textarea.fill(customPrompt);

				await page.screenshot({
					path: "mobile-screenshots/custom-02-prompt-entered.png",
					fullPage: true,
				});

				// Test continue button
				const continueButton = page.locator(
					'button:has-text("Continue with Custom Idea")'
				);
				if ((await continueButton.count()) > 0) {
					await continueButton.scrollIntoViewIfNeeded();
					await continueButton.click();

					await page.screenshot({
						path: "mobile-screenshots/custom-03-continued.png",
						fullPage: true,
					});
				}
			}
		}

		console.log("✅ Custom prompt mobile test completed");
	});

	// Test for mobile viewport issues and responsive design
	test("analyze mobile responsive design issues", async ({ page }) => {
		console.log("📱 Analyzing responsive design issues...");

		// Test different mobile viewport sizes
		const viewports = [
			{ width: 375, height: 667, name: "iPhone SE" },
			{ width: 390, height: 844, name: "iPhone 12" },
			{ width: 412, height: 915, name: "Pixel 5" },
		];

		// Login first
		await page.goto("/login");
		await page.fill('input[type="email"]', "barooahn@gmail.com");
		await page.fill('input[type="password"]', "g2442Y2L-17");
		await page.click('button[type="submit"]');
		await page.waitForURL("/", { timeout: 10000 });

		for (const viewport of viewports) {
			console.log(
				`Testing viewport: ${viewport.name} (${viewport.width}x${viewport.height})`
			);

			await page.setViewportSize({
				width: viewport.width,
				height: viewport.height,
			});
			await page.goto("/create");
			await page.waitForLoadState("networkidle");

			// Take screenshot for this viewport
			await page.screenshot({
				path: `mobile-screenshots/responsive-${viewport.name
					.toLowerCase()
					.replace(/\s+/g, "-")}.png`,
				fullPage: true,
			});

			// Check for horizontal scrolling issues
			const hasHorizontalScroll = await page.evaluate(() => {
				return (
					document.documentElement.scrollWidth >
					document.documentElement.clientWidth
				);
			});

			if (hasHorizontalScroll) {
				console.log(
					`⚠️  Horizontal scrolling detected on ${viewport.name}`
				);
			}

			// Check if buttons are still usable
			const yearButtons = await page
				.locator('[data-testid^="year-"][data-testid$="-selector"]')
				.all();
			for (let i = 0; i < Math.min(3, yearButtons.length); i++) {
				const box = await yearButtons[i].boundingBox();
				if (box && (box.width < 40 || box.height < 40)) {
					console.log(
						`⚠️  Year button ${i + 1} too small on ${
							viewport.name
						}: ${box.width}x${box.height}`
					);
				}
			}
		}

		console.log("✅ Responsive design analysis completed");
	});
});
