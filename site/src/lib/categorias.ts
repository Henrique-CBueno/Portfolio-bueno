import type { Cor } from './tipos';

/** Hashtag de categoria na legenda do Instagram → cor da pill. Categoria nova sem cor fica neutra. */
const cores: Record<string, Cor> = {
	resiliencia: 'vermelho',
	concorrencia: 'verde',
	consistencia: 'amarelo',
	seguranca: 'azul',
	arquitetura: 'roxo',
};

const nomes: Record<string, string> = {
	resiliencia: 'resiliência',
	concorrencia: 'concorrência',
	consistencia: 'consistência',
	seguranca: 'segurança',
	arquitetura: 'arquitetura',
};

export function categoria(hashtag?: string): { nome: string; cor: Cor } | undefined {
	if (!hashtag) return undefined;
	const chave = hashtag.replace(/^#/, '').toLowerCase();
	return { nome: nomes[chave] ?? chave, cor: cores[chave] ?? 'neutro' };
}
