// API do painel /admin (/admin-api/*): sempre com o token do Keycloak e o papel "admin".
import { pedirLoginDeNovo, tokenAtual } from './autenticacao';
import type { Contagem, Repositorio } from '../lib/tipos';

/** Mensagem do formulário de contato, como a API guarda. */
export interface Recebida {
	id: string;
	recebidaEm: string;
	nome: string;
	email: string;
	assunto: string | null;
	mensagem: string;
	lida: boolean;
	/** Marcada à mão no painel (o "responder" abre o e-mail; a API não sabe se ele saiu). */
	respondida: boolean;
	respondidaEm: string | null;
}

/** Seleção de destaques da home (nula = padrão) e os repositórios que podem entrar nela. */
export interface DestaquesNoPainel {
	selecao: string[] | null;
	repositorios: Repositorio[];
}

/** Contagem como o painel recebe: digitável ou lida da rede. */
export type ContagemNoPainel = Contagem & { editavel: boolean };

/** A API recusou o que foi mandado (400): `mensagem` é o que ela disse, pra mostrar na tela. */
export class Recusado extends Error {
	constructor(readonly mensagem: string) {
		super(mensagem);
	}
}

/** Uma chamada ao /admin-api com o token. 401 = sessão acabou: volta pro login. */
export async function chamar(caminho: string, init: RequestInit = {}) {
	const token = await tokenAtual();
	const resposta = await fetch(`${import.meta.env.PUBLIC_API_URL ?? ''}/admin-api${caminho}`, {
		...init,
		headers: { ...(init.headers ?? {}), Authorization: `Bearer ${token}` },
	});
	if (resposta.status === 401) pedirLoginDeNovo();
	return resposta;
}

async function json<T>(resposta: Response): Promise<T> {
	if (!resposta.ok) throw new Error(`HTTP ${resposta.status}`);
	return (await resposta.json()) as T;
}

const comJson = (metodo: string, corpo: unknown): RequestInit => ({
	method: metodo,
	headers: { 'Content-Type': 'application/json' },
	body: JSON.stringify(corpo),
});

export const listarMensagens = async () => json<Recebida[]>(await chamar('/mensagens'));

export async function marcarMensagem(id: string, marca: 'lida' | 'respondida', valor: boolean) {
	return json<Recebida>(await chamar(`/mensagens/${id}/${marca}`, comJson('PUT', { [marca]: valor })));
}

/** Apagar o que já não existe (404) conta como apagado. */
export async function apagarMensagem(id: string) {
	const resposta = await chamar(`/mensagens/${id}`, { method: 'DELETE' });
	if (!resposta.ok && resposta.status !== 404) throw new Error(`HTTP ${resposta.status}`);
}

export const buscarDestaques = async () => json<DestaquesNoPainel>(await chamar('/destaques'));

/** `null` volta ao padrão. Seleção inválida vira Recusado com o motivo. */
export async function salvarDestaques(selecao: string[] | null) {
	const resposta = await chamar('/destaques', comJson('PUT', { selecao }));
	if (resposta.status === 400) {
		const corpo = (await resposta.json().catch(() => ({}))) as { erros?: { selecao?: string } };
		throw new Recusado(corpo.erros?.selecao ?? 'seleção inválida');
	}
	await json<unknown>(resposta);
}

export const listarContagens = async () => json<ContagemNoPainel[]>(await chamar('/contagens'));

export async function salvarContagem(rede: string, valor: number | null) {
	await json<unknown>(await chamar(`/contagens/${rede}`, comJson('PUT', { valor })));
}
