/** Imagem pronta pra <img>: `srcset` com as larguras geradas no build. */
export interface Imagem {
	src: string;
	srcset?: string;
	width?: number;
	height?: number;
}

export type Cor = 'amarelo' | 'verde' | 'vermelho' | 'azul' | 'roxo' | 'neutro';

export type Rede = 'instagram' | 'tiktok' | 'youtube' | 'github' | 'linkedin';

export interface Video {
	id?: string;
	titulo: string;
	/** Pra onde o card leva: Instagram, senão TikTok, senão YouTube. */
	link: string;
	links?: { instagram?: string | null; tiktok?: string | null; youtube?: string | null };
	/** Caminho na API (/capas/<id>) ou URL; no build vira a capa baixada e convertida. */
	capa: Imagem | string;
	publicadoEm: string;
	/** Categoria escolhida no painel (ex.: "resiliencia"), que vira a pill colorida. */
	categoria?: string | null;
}

export interface Contagem {
	rede: Rede;
	valor: number | null;
	aproximado?: boolean;
	/** Digitado no painel (Instagram, TikTok); aí o site mostra quando foi atualizado. */
	manual?: boolean;
	atualizadoEm?: string | null;
}

/** O que a API entrega em GET /snapshot (as contagens também chegam por SSE). */
export interface Snapshot {
	lidoEm: string;
	videos: Video[];
	contagens: Contagem[];
	/** Repositórios fixados no GitHub; sem eles, o site usa a lista de src/dados/projetos.ts. */
	repositorios?: Repositorio[];
}

export interface Destaque {
	titulo: string;
	descricao: string;
	tags: { nome: string; cor: Cor }[];
	endereco: string;
	print?: { imagem: Imagem; alt: string };
	diagrama?: { nos: { nome: string; cor?: Cor }[]; saidas: { nome: string; cor?: Cor }[]; descricao: string };
	links: { rotulo: string; href: string; icone: 'externo' | 'github' }[];
	nota?: string;
	/** Ocupa a largura toda no desktop (print à esquerda, texto à direita). */
	largo?: boolean;
}

export interface Repositorio {
	nome: string;
	descricao?: string | null;
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
	foto?: { imagem: Imagem; alt: string };
}

/** O que a página recebe: renderizada no build e reaproveitada no navegador (hidratação). */
export interface Dados {
	/** Quando a página foi gerada; datas relativas usam isso até o navegador assumir. */
	geradoEm: string;
	snapshot: Snapshot;
	/** assinatura() dos vídeos como vieram da API, pra saber se a lista mudou depois do build. */
	assinatura: string;
}
