// Login no Keycloak (PKCE) e chamadas às rotas /admin-api da API com o token.
import Keycloak from 'keycloak-js';

export const api = import.meta.env.PUBLIC_API_URL ?? '';

export const keycloak = new Keycloak({
	url: import.meta.env.PUBLIC_KEYCLOAK_URL ?? 'http://localhost:8180',
	realm: import.meta.env.PUBLIC_KEYCLOAK_REALM ?? 'portfolio',
	clientId: import.meta.env.PUBLIC_KEYCLOAK_CLIENT ?? 'portfolio-admin',
});

let inicio: Promise<boolean> | undefined;
/** O keycloak-js só aceita um init(); o Fast Refresh do dev pode pedir de novo. */
export function entrar() {
	inicio ??= keycloak.init({ onLoad: 'login-required', pkceMethod: 'S256', checkLoginIframe: false });
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
/** AAAA-MM-DD no fuso de São Paulo (valor do <input type="date">). */
export const diaSP = (data = new Date()) => new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Sao_Paulo' }).format(data);
