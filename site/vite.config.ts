import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import { imagetools } from 'vite-imagetools';

/**
 * No "npm run dev" a página também sai renderizada no servidor, com o snapshot da API
 * (ou os dados de exemplo), igual ao que o prerender.mjs grava no build. Qualquer rota
 * (/projetos/revi, /qualquer-coisa) cai no index.html e é renderizada pro endereço pedido.
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
				const caminho = new URL(ctx.originalUrl ?? '/', 'http://local').pathname;
				return servidor.montar(html, await servidor.carregarDados(), caminho === '/index.html' ? '/' : caminho);
			},
		},
	};
}

export default defineConfig(({ isSsrBuild, isPreview }) => ({
	plugins: [react(), imagetools(), paginaNoDev()],
	// no preview, como no Nginx: /projetos/revi → projetos/revi.html, sem cair no index.html
	appType: isPreview ? 'mpa' : 'spa',
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
