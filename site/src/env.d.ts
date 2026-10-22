interface ImportMetaEnv {
	/** API usada no build pra ler vídeos e contagens (GET /snapshot). */
	readonly API_URL?: string;
	/** API pública usada no navegador (SSE em /stream, POST /contato e o painel), ex. https://api.henriquebueno.com. */
	readonly PUBLIC_API_URL?: string;
	/** Keycloak público (login do painel /admin), ex. https://auth.henriquebueno.com. */
	readonly PUBLIC_KEYCLOAK_URL?: string;
}

interface ImportMeta {
	readonly env: ImportMetaEnv;
}
