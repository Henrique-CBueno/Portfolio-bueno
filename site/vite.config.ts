import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import { imagetools } from 'vite-imagetools';

/**
 * No "npm run dev" a página também sai renderizada no servidor, com o snapshot da API
 * (ou os dados de exemplo), igual ao que o prerender.mjs grava no build.
 */
function paginaNoDev(): Plugin {
	return {
		name: 'pagina-no-dev',
		apply: 'serve',
		transformIndexHtml: {
			order: 'post',
			async handler(html, ctx) {
				if (!ctx.server || ctx.path !== '/index.html') return html;
				const servidor = await ctx.server.ssrLoadModule('/src/entry-server.tsx');
				return servidor.montar(html, await servidor.carregarDados());
			},
		},
	};
}

export default defineConfig(({ isSsrBuild }) => ({
	plugins: [react(), imagetools(), paginaNoDev()],
	// mantém os nomes que o docker-compose já passa (PUBLIC_API_URL, PUBLIC_KEYCLOAK_URL…)
	envPrefix: 'PUBLIC_',
	// a API libera CORS pra :4321 (ORIGENS no .env); mesma porta que o dev usava com o Astro
	server: { port: 4321, strictPort: true },
	preview: { port: 4321, strictPort: true },
	build: isSsrBuild
		? // imagens que só o servidor usa (as capas de exemplo); o prerender.mjs copia pro dist
			{ ssrEmitAssets: true }
		: { rolldownOptions: { input: { index: 'index.html', admin: 'admin/index.html' } } },
}));
