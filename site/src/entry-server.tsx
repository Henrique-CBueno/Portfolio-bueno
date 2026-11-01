// Renderização da página fora do navegador: usada pelo prerender.mjs no build e pelo Vite no dev.
import { renderToString } from 'react-dom/server';
import { App } from './App';
import type { Dados } from './lib/tipos';

export { carregarDados } from './lib/snapshot';

/** Põe a página renderizada e os dados (pra hidratação) no index.html. */
export function montar(html: string, dados: Dados): string {
	// "<" escapado: um título com </script> não fecha a tag antes da hora
	const json = JSON.stringify(dados).replace(/</g, '\\u003c');
	// o React 19 abre a saída com <link rel="preload"> (foto com fetchPriority="high"): vão pro <head>
	const corpo = renderToString(<App dados={dados} />);
	const preloads = corpo.match(/^(?:<link [^>]*>)*/)![0];
	return html
		.replace('</head>', () => `${preloads}</head>`)
		.replace('<!--app-->', () => corpo.slice(preloads.length))
		.replace('<!--dados-->', () => `<script type="application/json" id="dados">${json}</script>`);
}
