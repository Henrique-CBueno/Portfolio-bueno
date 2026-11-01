/// <reference types="vite/client" />

interface ImportMetaEnv {
	/** API pública usada no navegador (SSE em /stream, POST /contato e o painel), ex. https://api.henriquebueno.com. No dev, também é de onde o snapshot é lido. */
	readonly PUBLIC_API_URL?: string;
	/** Keycloak público (login do painel /admin), ex. https://auth.henriquebueno.com. */
	readonly PUBLIC_KEYCLOAK_URL?: string;
	/** Realm do Keycloak (padrão: portfolio). */
	readonly PUBLIC_KEYCLOAK_REALM?: string;
	/** Client público do painel, com PKCE (padrão: portfolio-admin). */
	readonly PUBLIC_KEYCLOAK_CLIENT?: string;
}

interface ImportMeta {
	readonly env: ImportMetaEnv;
}

/** Imagens locais em WebP com várias larguras (vite-imagetools, `&as=picture`). */
declare module '*&as=picture' {
	const imagem: { sources: Record<string, string>; img: { src: string; w: number; h: number } };
	export default imagem;
}
