import { destaques } from '../dados/projetos';
import type { Destaque, Repositorio } from './tipos';

/**
 * "Projetos em destaque": a seleção vem do painel (/admin) pela API, em ordem, como chaves
 * "projeto:<slug>" (curado, em dados/projetos.ts) ou "github:<nome>" (repositório público).
 * Sem seleção (nunca escolhida, ou API fora do ar) vale o padrão: todos os curados, na ordem do código.
 */
export type ItemDestaque =
	| { chave: string; tipo: 'projeto'; projeto: Destaque }
	| { chave: string; tipo: 'github'; repositorio: Repositorio };

export const MAXIMO_DESTAQUES = 6;
export const chaveDoProjeto = (slug: string) => `projeto:${slug}`;
export const chaveDoRepositorio = (nome: string) => `github:${nome}`;
export const PADRAO = destaques.map((d) => chaveDoProjeto(d.slug));

/** Chaves → itens. Chave que não existe mais (projeto removido do código, repo apagado) é ignorada. */
export function resolverDestaques(selecao: string[] | null | undefined, repositorios: Repositorio[]): ItemDestaque[] {
	const itens: ItemDestaque[] = [];
	for (const chave of selecao ?? PADRAO) {
		if (chave.startsWith('projeto:')) {
			const projeto = destaques.find((d) => chaveDoProjeto(d.slug) === chave);
			if (projeto) itens.push({ chave, tipo: 'projeto', projeto });
		} else if (chave.startsWith('github:')) {
			const repositorio = repositorios.find((r) => chaveDoRepositorio(r.nome) === chave);
			if (repositorio) itens.push({ chave, tipo: 'github', repositorio });
		}
	}
	return itens;
}

/** Endereços já em destaque: a lista "Fixados no GitHub" não repete o que está em cima. */
export function enderecosEmDestaque(itens: ItemDestaque[]): Set<string> {
	return new Set(itens.flatMap((i) => (i.tipo === 'projeto' ? i.projeto.links.map((l) => l.href) : [i.repositorio.url])).map((u) => u.toLowerCase()));
}
