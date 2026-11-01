// Login no Keycloak (PKCE) e chamadas às rotas /admin-api da API com o token.
import Keycloak from 'keycloak-js';

const api = import.meta.env.PUBLIC_API_URL ?? '';

const login = {
	url: import.meta.env.PUBLIC_KEYCLOAK_URL ?? 'http://localhost:8180',
	realm: import.meta.env.PUBLIC_KEYCLOAK_REALM ?? 'portfolio',
	clientId: import.meta.env.PUBLIC_KEYCLOAK_CLIENT ?? 'portfolio-admin',
};

export const keycloak = new Keycloak(login);

/**
 * O keycloak-js manda o navegador pro login sem conferir se o Keycloak está no ar: fora do ar, a pessoa
 * cairia na página de erro do navegador. Aqui só confere se ele responde (no-cors: não lê nada, só conecta).
 */
async function keycloakNoAr() {
	await fetch(`${login.url}/realms/${login.realm}`, { mode: 'no-cors', cache: 'no-store', signal: AbortSignal.timeout(6000) });
}

let inicio: Promise<boolean> | undefined;
/** O keycloak-js só aceita um init(); o Fast Refresh do dev pode pedir de novo. */
export function entrar() {
	inicio ??= keycloakNoAr().then(() => keycloak.init({ onLoad: 'login-required', pkceMethod: 'S256', checkLoginIframe: false }));
	// se falhou, a próxima tentativa começa do zero
	inicio.catch(() => { inicio = undefined; });
	return inicio;
}

export async function chamar(caminho: string, init: RequestInit = {}) {
	await keycloak.updateToken(30);
	const resposta = await fetch(`${api}/admin-api${caminho}`, {
		...init,
		headers: { ...(init.headers ?? {}), Authorization: `Bearer ${keycloak.token}` },
	});
	if (resposta.status === 401) keycloak.login();
	return resposta;
}

export const dataBR = new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'short', year: 'numeric', timeZone: 'America/Sao_Paulo' });