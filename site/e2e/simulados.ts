import type { Page } from '@playwright/test';

/** Os endereços que o build de produção chama (site/.env.production). */
export const API = 'https://api.henriquebueno.com';
export const AUTH = 'https://auth.henriquebueno.com';

const cors = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'GET, POST, OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type' };

/**
 * API simulada: /snapshot vazio (a home mostra os estados vazios), SSE desligado e POST /contato
 * respondendo `contato` (padrão: 202). Devolve a lista de mensagens que chegaram em /contato.
 */
export async function simularApi(page: Page, contato: { status: number; corpo?: unknown } = { status: 202, corpo: { ok: true } }) {
	const recebidas: unknown[] = [];
	await page.route(`${API}/**`, async (rota) => {
		const pedido = rota.request();
		if (pedido.method() === 'OPTIONS') return rota.fulfill({ status: 204, headers: cors });
		const caminho = new URL(pedido.url()).pathname;
		if (caminho === '/snapshot') return rota.fulfill({ status: 200, headers: cors, json: { lidoEm: new Date().toISOString(), videos: [], contagens: [], repositorios: [], publicos: [], destaques: null } });
		if (caminho === '/contato') {
			recebidas.push(pedido.postDataJSON());
			return rota.fulfill({ status: contato.status, headers: cors, json: contato.corpo ?? {} });
		}
		return rota.abort();
	});
	return recebidas;
}
