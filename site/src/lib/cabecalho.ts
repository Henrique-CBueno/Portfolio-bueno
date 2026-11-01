import { destaques } from '../dados/projetos';

/** Título e descrição de cada página: vão pro <head> no build e são trocados ao navegar. */
export interface Cabecalho {
	titulo: string;
	descricao: string;
}

export const SITE: Cabecalho = {
	titulo: 'Henrique Bueno · bueno_dev',
	descricao: 'Desenvolvedor backend (Java, Spring Boot, AWS). Vídeos de 90 segundos sobre sistemas distribuídos, com exemplos do Brasil.',
};

export const caminhoDoProjeto = (slug: string) => `/projetos/${slug}`;

export function projetoDoCaminho(caminho: string) {
	const slug = caminho.match(/^\/projetos\/([^/?#]+)\/?$/)?.[1];
	return slug ? destaques.find((d) => d.slug === decodeURIComponent(slug)) : undefined;
}

/** Até ~155 caracteres, cortando numa palavra (o que os buscadores mostram). */
function resumo(texto: string) {
	if (texto.length <= 155) return texto;
	return texto.slice(0, texto.lastIndexOf(' ', 152)) + '…';
}

export function cabecalho(caminho: string): Cabecalho {
	if (caminho === '/') return SITE;
	const projeto = projetoDoCaminho(caminho);
	if (projeto) return { titulo: `${projeto.titulo} · Henrique Bueno`, descricao: resumo(projeto.descricao) };
	return { titulo: 'Página não encontrada · Henrique Bueno', descricao: SITE.descricao };
}

/** Páginas geradas no build (o 404 vira dist/404.html, servido pelo Nginx pra qualquer endereço desconhecido). */
export const paginasDoBuild = ['/', ...destaques.map((d) => caminhoDoProjeto(d.slug)), '/404'];
