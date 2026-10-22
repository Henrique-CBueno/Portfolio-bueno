import type { ImageMetadata } from 'astro';

export type Cor = 'amarelo' | 'verde' | 'vermelho' | 'azul' | 'roxo' | 'neutro';

export type Rede = 'instagram' | 'tiktok' | 'youtube' | 'github' | 'linkedin';

export interface Video {
	titulo: string;
	link: string;
	capa: ImageMetadata | string;
	publicadoEm: string;
	hashtag?: string;
}

export interface Contagem {
	rede: Rede;
	valor: number | null;
	aproximado?: boolean;
}

/** O que a API entrega no build e depois por SSE. */
export interface Snapshot {
	lidoEm: string;
	videos: Video[];
	contagens: Contagem[];
}

export interface Destaque {
	titulo: string;
	descricao: string;
	tags: { nome: string; cor: Cor }[];
	endereco: string;
	print?: { imagem: ImageMetadata; alt: string };
	diagrama?: { nos: { nome: string; cor?: Cor }[]; saidas: { nome: string; cor?: Cor }[]; descricao: string };
	links: { rotulo: string; href: string; icone: 'externo' | 'github' }[];
	nota?: string;
	/** Ocupa a largura toda no desktop (print à esquerda, texto à direita). */
	largo?: boolean;
}

export interface Repositorio {
	nome: string;
	descricao?: string;
	linguagens: string[];
	url: string;
}

export interface Premio {
	evento: string;
	colocacao: string;
	quando?: string;
	onde?: string;
	projeto?: { nome?: string; descricao: string };
	contexto?: { texto: string; destaque?: string; depois?: string };
	organizadores: { nome: string; cor: Cor }[];
	foto?: { imagem: ImageMetadata; alt: string };
}
