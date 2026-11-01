// Renderização das páginas fora do navegador: usada pelo prerender.mjs no build e pelo Vite no dev.
// Só o que é fixo vai no HTML; vídeos, repositórios e seguidores aparecem como esqueleto e vêm da API no navegador.
import { renderToString } from 'react-dom/server';
import { StaticRouter } from 'react-router';
import { App } from './App';
import { cabecalho } from './lib/cabecalho';
import type { Dados } from './lib/tipos';

export { paginasDoBuild } from './lib/cabecalho';

/** O que o build grava em cada página. */
export const dadosDoBuild = (): Dados => ({ geradoEm: new Date().toISOString() });

const escapar = (texto: string) => texto.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;');

/** Põe a página de `caminho` renderizada, o <head> dela e os dados (pra hidratação) no index.html. */
export function montar(html: string, dados: Dados, caminho: string): string {
	// "<" escapado: um título com </script> não fecha a tag antes da hora
	const json = JSON.stringify(dados).replace(/</g, '\\u003c');
	const corpo = renderToString(
		<StaticRouter location={caminho}>
			<App dados={dados} />
		</StaticRouter>,
	);
	// o React 19 abre a saída com <link rel="preload"> (imagens com fetchPriority="high"): vão pro <head>
	const preloads = corpo.match(/^(?:<link [^>]*>)*/)![0];
	const { titulo, descricao } = cabecalho(caminho);
	const cabeca = [
		`<title>${escapar(titulo)}</title>`,
		`<meta name="description" content="${escapar(descricao)}" />`,
		`<meta property="og:title" content="${escapar(titulo)}" />`,
		`<meta property="og:description" content="${escapar(descricao)}" />`,
	].join('\n\t\t');
	return html
		.replace('<!--cabecalho-->', () => cabeca)
		.replace('</head>', () => `${preloads}</head>`)
		.replace('<!--app-->', () => corpo.slice(preloads.length))
		.replace('<!--dados-->', () => `<script type="application/json" id="dados">${json}</script>`);
}
