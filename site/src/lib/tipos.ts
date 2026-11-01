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

/** O que a API entrega em GET /snapshot, lido no navegador (as contagens também chegam por SSE). */
export interface Snapshot {
	lidoEm: string;
	videos: Video[];
	contagens: Contagem[];
	/** Repositórios do GitHub: os fixados (com token) ou os públicos mais recentes (sem token). */
	repositorios?: Repositorio[];
}

export interface Destaque {
	/** Endereço da página do projeto: /projetos/<slug>. Não mude depois de publicado (quebra links compartilhados). */
	slug: string;
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

/** Repositório do GitHub, como a API entrega (lido da API do GitHub, nada cadastrado à mão). */
export interface Repositorio {
	nome: string;
	descricao?: string | null;
	/** Da maior pra menor. */
	linguagens: string[];
	url: string;
	/** Cor que o GitHub dá à primeira linguagem (nula sem token). */
	corLinguagem?: string | null;
	/** Último push. */
	atualizadoEm?: string | null;
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

/** O que a página recebe do build (o mesmo valor no HTML e na hidratação). Os dados da API chegam depois, no navegador. */
export interface Dados {
	/** Quando a página foi gerada: anos de experiência e o ano do rodapé saem daqui. */
	geradoEm: string;
}
