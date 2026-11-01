// Login do painel /admin no Keycloak (PKCE, papel "admin").
import Keycloak from 'keycloak-js';

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

/**
 * Exige login: quem não está autenticado é mandado pra tela do Keycloak e volta pro painel depois.
 * O keycloak-js só aceita um init(); o Fast Refresh do dev pode pedir de novo.
 */
export function entrar() {
	inicio ??= keycloakNoAr().then(() => keycloak.init({ onLoad: 'login-required', pkceMethod: 'S256', checkLoginIframe: false }));
	// se falhou, a próxima tentativa começa do zero
	inicio.catch(() => {
		inicio = undefined;
	});
	return inicio;
}

export const usuarioLogado = () => String(keycloak.tokenParsed?.preferred_username ?? '');
export const ehAdmin = () => keycloak.hasRealmRole('admin');
export const sair = () => keycloak.logout({ redirectUri: `${location.origin}/` });

/** Token válido pra próxima chamada (renova se faltar menos de 30 s). */
export async function tokenAtual() {
	await keycloak.updateToken(30);
	return keycloak.token;
}

/** A API recusou o token: de volta pro login. */
export const pedirLoginDeNovo = () => keycloak.login();
