import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
	baseDirectory: __dirname,
});

const eslintConfig = [
	...compat.extends("next/core-web-vitals", "next/typescript"),
	{
		// Ignore non-source files and legacy/auxiliary scripts for linting
		ignores: [
			"node_modules/**",
			".next/**",
			"out/**",
			"build/**",
			"next-env.d.ts",
			// Tests & jest helpers (not part of production build)
			"__tests__/**",
			"jest.config.js",
			"jest.setup.js",
			// One-off local script
			"take-navigation-screenshots.js",
			// Temporarily ignore stories API file while we land parser-safe refactor
			"src/app/api/stories/**",
		],
	},
	{
		files: [
			"src/app/**/*.ts",
			"src/app/**/*.tsx",
			"src/components/**/*.ts",
			"src/components/**/*.tsx",
		],
		rules: {
			"@typescript-eslint/no-explicit-any": "off",
		},
	},
];

export default eslintConfig;
