import type { Cor } from './tipos';

/** Categoria do vídeo (escolhida no painel) → cor da pill. Categoria nova sem cor fica neutra. */
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

export function categoria(chaveOuHashtag?: string | null): { nome: string; cor: Cor } | undefined {
	if (!chaveOuHashtag) return undefined;
	const chave = chaveOuHashtag.replace(/^#/, '').toLowerCase();
	return { nome: nomes[chave] ?? chave, cor: cores[chave] ?? 'neutro' };
}
