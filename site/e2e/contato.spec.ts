import { expect, test } from '@playwright/test';
import { simularApi } from './simulados';

test.describe('formulário de contato', () => {
	test('valida cada campo, com mensagem própria, e não envia nada inválido', async ({ page }) => {
		const recebidas = await simularApi(page);
		await page.goto('/#contato');
		const form = page.locator('form.formulario');

		await form.getByRole('button', { name: /enviar mensagem/ }).click();
		await expect(form.locator('#aviso-nome')).toHaveText('conta como posso te chamar');
		await expect(form.locator('#aviso-email')).toHaveText('falta o e-mail');
		await expect(form.locator('#aviso-mensagem')).toHaveText('falta a mensagem');
		await expect(form.getByLabel('nome')).toBeFocused();

		await form.getByLabel('e-mail').fill('ana@exemplo');
		await form.getByLabel('mensagem').fill('oi tudo bem');
		await form.getByRole('button', { name: /enviar mensagem/ }).click();
		await expect(form.locator('#aviso-email')).toHaveText('e-mail inválido');
		await expect(form.locator('#aviso-mensagem')).toHaveText('mensagem com no mínimo 20 caracteres');

		expect(recebidas).toHaveLength(0);
	});

	test('mensagem válida vai pra API e o visitante vê o sucesso', async ({ page }) => {
		const recebidas = await simularApi(page);
		await page.goto('/#contato');
		const form = page.locator('form.formulario');

		await form.getByLabel('nome').fill('Ana');
		await form.getByLabel('e-mail').fill('ana@exemplo.com');
		await form.getByLabel('mensagem').fill('Vi seus vídeos e queria conversar sobre uma parceria.');
		await form.getByRole('button', { name: /enviar mensagem/ }).click();

		await expect(form.getByText(/mensagem enviada ✓/)).toBeVisible();
		expect(recebidas).toEqual([{ nome: 'Ana', email: 'ana@exemplo.com', assunto: '', mensagem: 'Vi seus vídeos e queria conversar sobre uma parceria.' }]);
		await expect(form.getByLabel('nome')).toHaveValue('');
	});

	test('o que a API recusar aparece no campo certo', async ({ page }) => {
		await simularApi(page, { status: 400, corpo: { ok: false, erros: { email: 'e-mail inválido' } } });
		await page.goto('/#contato');
		const form = page.locator('form.formulario');

		await form.getByLabel('nome').fill('Ana');
		await form.getByLabel('e-mail').fill('ana@exemplo.com');
		await form.getByLabel('mensagem').fill('Vi seus vídeos e queria conversar sobre uma parceria.');
		await form.getByRole('button', { name: /enviar mensagem/ }).click();

		await expect(form.locator('#aviso-email')).toHaveText('e-mail inválido');
		await expect(form.getByLabel('e-mail')).toBeFocused();
	});
});
