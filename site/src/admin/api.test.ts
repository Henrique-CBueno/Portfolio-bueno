import { beforeEach, describe, expect, it, vi } from 'vitest';

// keycloak-js falso: guarda as opções e deixa cada teste decidir o que init/updateToken fazem
const kc = vi.hoisted(() => ({
	opcoes: undefined as unknown,
	init: vi.fn(),
	updateToken: vi.fn(),
	login: vi.fn(),
	token: 'tk-123' as string | undefined,
}));
vi.mock('keycloak-js', () => ({
	default: class {
		token = kc.token;
		init = kc.init;
		updateToken = kc.updateToken;
		login = kc.login;
		constructor(opcoes: unknown) { kc.opcoes = opcoes; }
	},
}));

const KEYCLOAK = 'http://auth.teste';

/** api.ts guarda o init numa variável do módulo: cada teste carrega o módulo do zero. */
async function carregar() {
	vi.resetModules();
	return import('./api');
}

describe('login do painel /admin', () => {
	let fetch: ReturnType<typeof vi.fn>;

	beforeEach(() => {
		vi.stubEnv('PUBLIC_KEYCLOAK_URL', KEYCLOAK);
		vi.stubEnv('PUBLIC_API_URL', 'http://api.teste');
		fetch = vi.fn();
		vi.stubGlobal('fetch', fetch);
		kc.init.mockReset().mockResolvedValue(true);
		kc.updateToken.mockReset().mockResolvedValue(true);
		kc.login.mockReset();
	});

	it('exige login: quem não está autenticado é mandado pro Keycloak (login-required, com PKCE)', async () => {
		fetch.mockResolvedValue(new Response(null, { status: 200 }));
		const { entrar } = await carregar();
		await entrar();

		expect(kc.opcoes).toEqual({ url: KEYCLOAK, realm: 'portfolio', clientId: 'portfolio-admin' });
		expect(kc.init).toHaveBeenCalledWith(expect.objectContaining({ onLoad: 'login-required', pkceMethod: 'S256' }));
	});

	it('confere se o Keycloak responde antes de redirecionar; fora do ar, não manda pra uma página morta', async () => {
		fetch.mockRejectedValue(new TypeError('Failed to fetch'));
		const { entrar } = await carregar();

		await expect(entrar()).rejects.toThrow();
		expect(fetch).toHaveBeenCalledWith(`${KEYCLOAK}/realms/portfolio`, expect.objectContaining({ mode: 'no-cors' }));
		expect(kc.init).not.toHaveBeenCalled();
	});

	it('toda chamada à API leva o token; se a API recusar (401), volta pro login', async () => {
		fetch.mockResolvedValue(new Response(null, { status: 401 }));
		const { chamar } = await carregar();
		await chamar('/mensagens');

		expect(kc.updateToken).toHaveBeenCalled();
		const [url, init] = fetch.mock.calls[0];
		expect(url).toBe('http://api.teste/admin-api/mensagens');
		expect(init.headers).toEqual(expect.objectContaining({ Authorization: 'Bearer tk-123' }));
		expect(kc.login).toHaveBeenCalled();
	});
});
