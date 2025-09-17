import { test, expect, devices } from "@playwright/test";

// Configure test to use mobile viewport
test.use({
	...devices["iPhone 12"],
	// Additional mobile-specific settings
	hasTouch: true,
	isMobile: true,
	baseURL: "http://localhost:3000",
});

test.describe("Mobile Story Reading UX Analysis", () => {
	test("analyze mobile story reading experience on /read page", async ({ page }) => {
		// Enable console logging to capture any mobile-specific errors
		page.on("console", (msg) => console.log("PAGE LOG:", msg.text()));
		page.on("pageerror", (err) =>
			console.log("PAGE ERROR:", err.message)
		);

		console.log("🔍 Starting mobile UX analysis for story reading...");

		// Step 1: Navigate to login page and authenticate
		console.log("📱 Step 1: Logging in...");
		await page.goto("/login");

		// Take screenshot of login page on mobile
		await page.screenshot({
			path: "mobile-screenshots/reading-01-login-page.png",
			fullPage: true,
		});

		// Login with provided credentials
		await page.fill('input[type="email"]', "barooahn@gmail.com");
		await page.fill('input[type="password"]', "g2442Y2L-17");
		await page.click('button[type="submit"]');

		// Wait for successful login redirect
		await page.waitForURL("/", { timeout: 10000 });
		console.log("✅ Login successful");

		// Step 2: Navigate to a story reading page (using mock story ID)
		console.log("📱 Step 2: Navigating to story reading page...");
		await page.goto("/read/1");  // Mock story ID

		// Wait for page to fully load
		await page.waitForLoadState("networkidle");

		// Take screenshot of initial reading page
		await page.screenshot({
			path: "mobile-screenshots/reading-02-initial-page.png",
			fullPage: true,
		});

		// Step 3: Analyze story reading interface elements
		console.log("📱 Step 3: Analyzing reading interface...");

		// Check if story title is visible
		const storyTitle = page.locator('h1').first();
		await expect(storyTitle).toBeVisible();
		
		// Check if story text is visible and readable
		const storyText = page.locator('.reading-text, .netflix-text-container');
		await expect(storyText).toBeVisible();

		// Check navigation controls are properly sized for mobile
		const prevButton = page.locator('button:has-text("Previous")');
		const nextButton = page.locator('button:has-text("Next"), button:has-text("Questions")');

		if (await prevButton.isVisible()) {
			const prevBox = await prevButton.boundingBox();
			console.log(`Previous button size: ${prevBox?.width}x${prevBox?.height}`);
			if (prevBox && prevBox.height < 44) {
				console.log("⚠️ Previous button too small for mobile touch");
			}
		}

		if (await nextButton.isVisible()) {
			const nextBox = await nextButton.boundingBox();
			console.log(`Next button size: ${nextBox?.width}x${nextBox?.height}`);
			if (nextBox && nextBox.height < 44) {
				console.log("⚠️ Next button too small for mobile touch");
			}
		}

		// Test fullscreen toggle button
		const fullscreenToggle = page.locator('button[title*="Fullscreen"], button[title*="fullscreen"]');
		if (await fullscreenToggle.count() > 0) {
			const fsBox = await fullscreenToggle.boundingBox();
			console.log(`Fullscreen toggle size: ${fsBox?.width}x${fsBox?.height}`);
			if (fsBox && (fsBox.width < 44 || fsBox.height < 44)) {
				console.log("⚠️ Fullscreen toggle too small for mobile touch");
			}
		}

		// Check progress bar visibility
		const progressBar = page.locator('[style*="width"]').filter({ hasText: /\d+%/ }).or(page.locator('.progress, [role="progressbar"]'));
		if (await progressBar.count() > 0) {
			console.log("✅ Progress bar found");
		} else {
			console.log("⚠️ No visible progress indicator");
		}

		// Step 4: Test story navigation
		console.log("📱 Step 4: Testing story navigation...");

		// Try to navigate to next segment
		if (await nextButton.isVisible()) {
			await nextButton.click();
			await page.waitForTimeout(1000);
			
			await page.screenshot({
				path: "mobile-screenshots/reading-03-after-next.png",
				fullPage: true,
			});
		}

		// Check if audio controls are present and properly sized
		const audioControls = page.locator('button:has([data-lucide*="play"]), button:has([data-lucide*="pause"]), button:has([data-lucide*="volume"])');
		const audioControlCount = await audioControls.count();
		console.log(`Found ${audioControlCount} audio controls`);

		for (let i = 0; i < audioControlCount; i++) {
			const control = audioControls.nth(i);
			const box = await control.boundingBox();
			if (box) {
				console.log(`Audio control ${i + 1}: ${box.width}x${box.height}`);
				if (box.width < 44 || box.height < 44) {
					console.log(`⚠️ Audio control ${i + 1} too small for mobile`);
				}
			}
		}

		// Step 5: Test fullscreen mode if available
		console.log("📱 Step 5: Testing fullscreen mode...");
		
		if (await fullscreenToggle.count() > 0) {
			await fullscreenToggle.first().click();
			await page.waitForTimeout(1000);
			
			await page.screenshot({
				path: "mobile-screenshots/reading-04-fullscreen.png",
				fullPage: true,
			});
			
			// Test if content is still readable in fullscreen
			await expect(storyText).toBeVisible();
			
			// Exit fullscreen
			const exitFullscreen = page.locator('button[title*="Exit"], button[title*="exit"]').or(fullscreenToggle);
			if (await exitFullscreen.count() > 0) {
				await exitFullscreen.first().click();
				await page.waitForTimeout(1000);
			}
		}

		// Step 6: Test scrolling and text readability
		console.log("📱 Step 6: Testing text readability and scrolling...");

		// Check if text is large enough for mobile reading
		const textElement = page.locator('.reading-text, .netflix-text-container').first();
		const textStyles = await textElement.evaluate(element => {
			const computed = window.getComputedStyle(element);
			return {
				fontSize: computed.fontSize,
				lineHeight: computed.lineHeight,
				color: computed.color,
				backgroundColor: computed.backgroundColor
			};
		});
		
		console.log("Text styles:", textStyles);
		
		// Parse font size to check if it's appropriate for mobile
		const fontSize = parseInt(textStyles.fontSize);
		if (fontSize < 16) {
			console.log(`⚠️ Text too small for mobile: ${fontSize}px (recommend 16px+)`);
		} else {
			console.log(`✅ Text size appropriate for mobile: ${fontSize}px`);
		}

		// Test viewport and horizontal scrolling
		const hasHorizontalScroll = await page.evaluate(() => {
			return document.documentElement.scrollWidth > document.documentElement.clientWidth;
		});

		if (hasHorizontalScroll) {
			console.log("⚠️ Horizontal scrolling detected - may indicate responsive design issues");
		} else {
			console.log("✅ No horizontal scrolling - good responsive design");
		}

		// Step 7: Navigate through multiple story segments to test consistency
		console.log("📱 Step 7: Testing multi-segment navigation...");
		
		let segmentCount = 0;
		const maxSegments = 5; // Limit to avoid infinite loops
		
		while (segmentCount < maxSegments) {
			const nextBtn = page.locator('button:has-text("Next")');
			if (await nextBtn.count() > 0 && await nextBtn.isEnabled()) {
				await nextBtn.click();
				await page.waitForTimeout(1000);
				segmentCount++;
				
				// Take screenshot of each segment
				await page.screenshot({
					path: `mobile-screenshots/reading-05-segment-${segmentCount}.png`,
					fullPage: true,
				});
				
				// Verify text is still readable
				await expect(storyText).toBeVisible();
			} else {
				break;
			}
		}
		
		console.log(`✅ Successfully navigated through ${segmentCount} story segments`);

		// Final analysis summary
		console.log("📊 Mobile Reading UX Analysis Complete");
		
		const viewport = page.viewportSize();
		const documentSize = await page.evaluate(() => ({
			width: document.documentElement.scrollWidth,
			height: document.documentElement.scrollHeight,
		}));

		console.log(`📱 Viewport: ${viewport?.width}x${viewport?.height}`);
		console.log(`📄 Document: ${documentSize.width}x${documentSize.height}`);
		console.log("📸 Screenshots saved to mobile-screenshots/ directory");

		// Final screenshot
		await page.screenshot({
			path: "mobile-screenshots/reading-06-final-state.png",
			fullPage: true,
		});
	});

	// Test different mobile viewport sizes
	test("test reading experience across different mobile viewports", async ({ page }) => {
		console.log("📱 Testing responsive reading experience...");

		// Test different mobile viewport sizes
		const viewports = [
			{ width: 375, height: 667, name: "iPhone SE" },
			{ width: 390, height: 844, name: "iPhone 12" },
			{ width: 412, height: 915, name: "Pixel 5" },
			{ width: 360, height: 640, name: "Galaxy S5" },
		];

		// Login first
		await page.goto("/login");
		await page.fill('input[type="email"]', "barooahn@gmail.com");
		await page.fill('input[type="password"]', "g2442Y2L-17");
		await page.click('button[type="submit"]');
		await page.waitForURL("/", { timeout: 10000 });

		for (const viewport of viewports) {
			console.log(
				`Testing ${viewport.name} (${viewport.width}x${viewport.height})`
			);

			await page.setViewportSize({
				width: viewport.width,
				height: viewport.height,
			});
			
			await page.goto("/read/1");
			await page.waitForLoadState("networkidle");

			// Take screenshot for this viewport
			await page.screenshot({
				path: `mobile-screenshots/responsive-reading-${viewport.name
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
					`⚠️ Horizontal scrolling detected on ${viewport.name}`
				);
			}

			// Check if navigation buttons are still usable
			const navButtons = page.locator('button:has-text("Previous"), button:has-text("Next"), button:has-text("Questions")');
			const buttonCount = await navButtons.count();
			
			for (let i = 0; i < buttonCount; i++) {
				const button = navButtons.nth(i);
				const box = await button.boundingBox();
				const buttonText = await button.textContent();
				
				if (box && (box.width < 40 || box.height < 40)) {
					console.log(
						`⚠️ ${buttonText} button too small on ${viewport.name}: ${box.width}x${box.height}`
					);
				}
			}

			// Check text readability
			const textElement = page.locator('.reading-text, .netflix-text-container').first();
			if (await textElement.count() > 0) {
				const fontSize = await textElement.evaluate(element => {
					const computed = window.getComputedStyle(element);
					return parseInt(computed.fontSize);
				});
				
				if (fontSize < 16) {
					console.log(`⚠️ Text too small on ${viewport.name}: ${fontSize}px`);
				}
			}
		}

		console.log("✅ Responsive reading test completed");
	});
});