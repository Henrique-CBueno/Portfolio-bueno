import { expect, test } from '@playwright/test';
import { AUTH } from './simulados';

test.describe('painel /admin', () => {
	test('sem login, quem abre /admin é mandado pra tela de login do Keycloak', async ({ page }) => {
		await page.route(`${AUTH}/**`, (rota) =>
			rota.request().url().includes('/protocol/openid-connect/auth')
				? rota.fulfill({ contentType: 'text/html', body: '<h1>Login do Keycloak (simulado)</h1>' })
				: rota.fulfill({ status: 200, body: '' }),
		);

		await page.goto('/admin');
		await page.waitForURL(/\/protocol\/openid-connect\/auth/);

		const url = new URL(page.url());
		expect(url.origin).toBe(AUTH);
		expect(url.pathname).toBe('/realms/portfolio/protocol/openid-connect/auth');
		expect(url.searchParams.get('client_id')).toBe('portfolio-admin');
		expect(url.searchParams.get('code_challenge_method')).toBe('S256');
		// pede o login de verdade: com prompt=none seria só uma checagem silenciosa de sessão (check-sso), sem bloquear
		expect(url.searchParams.get('prompt')).toBeNull();
		// depois do login, volta pro painel
		expect(url.searchParams.get('redirect_uri')).toMatch(/\/admin\/$/);
		await expect(page.getByRole('heading', { name: 'Login do Keycloak (simulado)' })).toBeVisible();
	});

	test('com o login fora do ar, avisa e o painel não abre', async ({ page }) => {
		await page.route(`${AUTH}/**`, (rota) => rota.abort());

		await page.goto('/admin/');

		await expect(page.getByText('Não deu pra carregar o login')).toBeVisible();
		await expect(page.getByRole('button', { name: /tentar de novo/ })).toBeVisible();
		await expect(page.getByRole('heading', { name: /Mensagens/ })).toHaveCount(0);
	});
});
