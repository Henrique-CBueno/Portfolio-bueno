import { defineConfig, devices } from '@playwright/test';

/**
 * Testes de ponta a ponta (npm run test:e2e): o build de produção servido pelo vite preview, num Chrome de verdade.
 * Keycloak e API são simulados em cada teste (page.route), então nada sai pra internet e não precisa do Docker.
 */
const PORTA = 4173;

export default defineConfig({
	testDir: 'e2e',
	fullyParallel: true,
	reporter: process.env.CI ? 'github' : 'list',
	use: {
		baseURL: `http://localhost:${PORTA}`,
		// o Chrome instalado na máquina; no CI: npx playwright install chrome
		channel: 'chrome',
		trace: 'retain-on-failure',
	},
	projects: [
		{ name: 'desktop', use: { viewport: { width: 1440, height: 900 } } },
		{ name: 'celular', use: { ...devices['Pixel 7'], channel: 'chrome' } },
	],
	webServer: {
		command: `npm run build && npx vite preview --port ${PORTA} --strictPort`,
		url: `http://localhost:${PORTA}`,
		reuseExistingServer: !process.env.CI,
		timeout: 180_000,
	},
});
