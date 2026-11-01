/// <reference types="vitest/config" />
import { defineConfig, type EnvironmentModuleNode, type Plugin, type ViteDevServer } from 'vite';
import react from '@vitejs/plugin-react';
import { imagetools } from 'vite-imagetools';

/**
 * No dev o Vite põe o CSS na página pelo JavaScript, depois que ele carrega: como o HTML já vem renderizado,
 * a página aparecia sem estilo por um instante a cada F5. Aqui o CSS que a página importa vai direto no HTML,
 * com data-vite-dev-id: o cliente do Vite reconhece essas tags e continua atualizando quando o .css muda.
 * (No build isso não existe: o CSS já sai como <link> no <head>.)
 */
async function cssDaPagina(servidor: ViteDevServer): Promise<string> {
	// o grafo do ambiente ssr tem a árvore inteira que o ssrLoadModule carregou (o moduleGraph genérico, não)
	const grafo = servidor.environments.ssr.moduleGraph;
	const entrada = await grafo.getModuleByUrl('/src/entry-server.tsx');
	const vistos = new Set<EnvironmentModuleNode>();
	const css: EnvironmentModuleNode[] = [];
	const visitar = (m: EnvironmentModuleNode | undefined) => {
		if (!m || vistos.has(m)) return;
		vistos.add(m);
		if (m.id && /\.css($|\?)/.test(m.url)) css.push(m);
		m.importedModules.forEach(visitar);
	};
	visitar(entrada);
	const estilos = await Promise.all(
		css.map(async (m) => {
			const codigo = (await servidor.transformRequest(`${m.url}${m.url.includes('?') ? '&' : '?'}direct`))?.code ?? '';
			return `<style type="text/css" data-vite-dev-id="${m.id}">${codigo}</style>`;
		}),
	);
	return estilos.join('\n');
}

/**
 * No "npm run dev" a página também sai renderizada no servidor, igual ao que o prerender.mjs
 * grava no build. Qualquer rota
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
				const pagina = servidor.montar(html, servidor.dadosDoBuild(), caminho === '/index.html' ? '/' : caminho);
				const estilos = await cssDaPagina(ctx.server);
				return pagina.replace('</head>', () => `${estilos}\n</head>`);
			},
		},
	};
}

/**
 * /admin sem a barra final: o Vite só acha admin/index.html em /admin/, e sem ela entregava o site (o roteador
 * mostrava o 404). Redireciona como o Apache da Hostinger faz em produção (DirectorySlash).
 */
function barraNoAdmin(): Plugin {
	const redirecionar = (req: { url?: string }, res: { writeHead: (s: number, h: Record<string, string>) => void; end: () => void }, next: () => void) => {
		const url = new URL(req.url ?? '/', 'http://local');
		if (url.pathname !== '/admin') return next();
		res.writeHead(301, { Location: `/admin/${url.search}` });
		res.end();
	};
	return {
		name: 'barra-no-admin',
		configureServer: (servidor) => {
			servidor.middlewares.use(redirecionar);
		},
		configurePreviewServer: (servidor) => {
			servidor.middlewares.use(redirecionar);
		},
	};
}

export default defineConfig(({ isSsrBuild, isPreview }) => ({
	plugins: [react(), imagetools(), paginaNoDev(), barraNoAdmin()],
	// no preview, como no Nginx: /projetos/revi → projetos/revi.html, sem cair no index.html
	appType: isPreview ? 'mpa' : 'spa',
	// mantém os nomes que o docker-compose já passa (PUBLIC_API_URL, PUBLIC_KEYCLOAK_URL…)
	envPrefix: 'PUBLIC_',
	// a API libera CORS pra :4321 (ORIGENS no .env); mesma porta que o dev usava com o Astro
	server: { port: 4321, strictPort: true },
	preview: { port: 4321, strictPort: true },
	build: isSsrBuild ? {} : { rolldownOptions: { input: { index: 'index.html', admin: 'admin/index.html' } } },
	// npm test: componentes e regras no jsdom (os testes no navegador de verdade ficam em e2e/, com o Playwright)
	test: {
		environment: 'jsdom',
		include: ['src/**/*.test.{ts,tsx}'],
		setupFiles: ['src/test/setup.ts'],
	},
}));
