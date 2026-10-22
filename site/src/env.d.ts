interface ImportMetaEnv {
	/** API usada no build pra ler vídeos e contagens (GET /snapshot). */
	readonly API_URL?: string;
	/** API pública usada no navegador (SSE em /stream e POST /contato). */
	readonly PUBLIC_API_URL?: string;
}

interface ImportMeta {
	readonly env: ImportMetaEnv;
}
