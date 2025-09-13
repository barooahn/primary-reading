import { test, expect, devices } from "@playwright/test";

// Configure test to use mobile viewport
test.use({
	...devices["iPhone 12"],
	// Additional mobile-specific settings
	hasTouch: true,
	isMobile: true,
	baseURL: "http://localhost:3000",
});

test.describe("Mobile Story Reading UX Analysis (Direct)", () => {
	test("analyze mobile story reading UI without authentication", async ({ page }) => {
		// Enable console logging to capture any mobile-specific errors
		page.on("console", (msg) => console.log("PAGE LOG:", msg.text()));
		page.on("pageerror", (err) =>
			console.log("PAGE ERROR:", err.message)
		);

		console.log("🔍 Starting direct mobile UX analysis for story reading...");

		// Step 1: Go directly to reading page (bypassing auth for UX analysis)
		console.log("📱 Step 1: Navigating directly to story reading page...");
		await page.goto("/read/b6932872-7059-4f2b-8463-1878e145a456");  // Real story ID

		// Wait for page to load
		await page.waitForLoadState("networkidle");

		// Take screenshot of reading page
		await page.screenshot({
			path: "mobile-screenshots/direct-01-reading-page.png",
			fullPage: true,
		});

		// Step 2: Analyze the reading interface
		console.log("📱 Step 2: Analyzing reading interface elements...");

		// Check if story content is visible (even if it's mock data)
		const contentContainer = page.locator('.netflix-reading-container, .reading-container, .container');
		await expect(contentContainer).toBeVisible();

		// Check story text
		const storyText = page.locator('.reading-text, .netflix-text-container, [class*="text"], p, div').filter({ hasText: /\w{10,}/ }).first();
		if (await storyText.count() > 0) {
			console.log("✅ Story text found and visible");
			
			// Check text size
			const fontSize = await storyText.evaluate(element => {
				const computed = window.getComputedStyle(element);
				return parseInt(computed.fontSize);
			});
			
			console.log(`Text font size: ${fontSize}px`);
			if (fontSize < 16) {
				console.log("⚠️ Text too small for mobile reading");
			} else {
				console.log("✅ Text size appropriate for mobile");
			}
		}

		// Check navigation buttons
		const buttons = page.locator('button').all();
		const buttonDetails = [];
		
		for (const button of await buttons) {
			const text = await button.textContent();
			const box = await button.boundingBox();
			const isVisible = await button.isVisible();
			
			if (isVisible && box && text) {
				buttonDetails.push({
					text: text.trim(),
					width: box.width,
					height: box.height,
					tooSmall: box.width < 44 || box.height < 44
				});
			}
		}

		console.log("Button analysis:");
		buttonDetails.forEach((btn, i) => {
			console.log(`  ${i+1}. "${btn.text}": ${btn.width}x${btn.height}${btn.tooSmall ? ' ⚠️ TOO SMALL' : ' ✅'}`);
		});

		// Step 3: Test responsive behavior
		console.log("📱 Step 3: Testing responsive behavior...");

		// Check for horizontal scrolling
		const hasHorizontalScroll = await page.evaluate(() => {
			return document.documentElement.scrollWidth > document.documentElement.clientWidth;
		});

		if (hasHorizontalScroll) {
			console.log("⚠️ Horizontal scrolling detected");
		} else {
			console.log("✅ No horizontal scrolling - good responsive design");
		}

		// Check viewport usage
		const viewport = page.viewportSize();
		const documentWidth = await page.evaluate(() => document.documentElement.scrollWidth);
		
		console.log(`Viewport: ${viewport?.width}px, Document: ${documentWidth}px`);
		
		if (documentWidth > (viewport?.width || 0)) {
			console.log("⚠️ Content wider than viewport");
		} else {
			console.log("✅ Content fits viewport");
		}

		// Step 4: Test different orientations/viewport sizes
		console.log("📱 Step 4: Testing different viewport sizes...");

		const viewports = [
			{ width: 375, height: 667, name: "iPhone SE" },
			{ width: 414, height: 896, name: "iPhone XR" },
			{ width: 360, height: 640, name: "Galaxy S5" },
		];

		for (const vp of viewports) {
			console.log(`Testing ${vp.name} (${vp.width}x${vp.height})`);
			
			await page.setViewportSize({ width: vp.width, height: vp.height });
			await page.waitForTimeout(1000); // Let layout settle
			
			await page.screenshot({
				path: `mobile-screenshots/viewport-${vp.name.toLowerCase().replace(/\s+/g, "-")}.png`,
				fullPage: true,
			});

			// Check button sizes at this viewport
			const navButton = page.locator('button').filter({ hasText: /Next|Previous|Questions/ }).first();
			if (await navButton.count() > 0) {
				const box = await navButton.boundingBox();
				if (box && (box.width < 44 || box.height < 44)) {
					console.log(`⚠️ Navigation button too small on ${vp.name}: ${box.width}x${box.height}`);
				} else if (box) {
					console.log(`✅ Navigation button size OK on ${vp.name}: ${box.width}x${box.height}`);
				}
			}

			// Check for horizontal overflow at this viewport
			const overflow = await page.evaluate(() => {
				return document.documentElement.scrollWidth > document.documentElement.clientWidth;
			});
			
			if (overflow) {
				console.log(`⚠️ Content overflow on ${vp.name}`);
			}
		}

		// Step 5: Check text contrast and readability
		console.log("📱 Step 5: Analyzing text readability...");
		
		const textElements = page.locator('p, div, span').filter({ hasText: /\w{5,}/ });
		const textCount = await textElements.count();
		console.log(`Found ${textCount} text elements`);

		if (textCount > 0) {
			const firstText = textElements.first();
			const styles = await firstText.evaluate(element => {
				const computed = window.getComputedStyle(element);
				return {
					color: computed.color,
					backgroundColor: computed.backgroundColor,
					fontSize: computed.fontSize,
					lineHeight: computed.lineHeight,
					fontWeight: computed.fontWeight
				};
			});
			
			console.log("Text styling:", styles);
		}

		// Step 6: Final assessment
		console.log("📱 Step 6: Final mobile UX assessment...");

		await page.screenshot({
			path: "mobile-screenshots/final-assessment.png",
			fullPage: true,
		});

		console.log("✅ Mobile reading UX analysis complete!");
		console.log("📸 Check mobile-screenshots/ folder for visual analysis");
	});
});