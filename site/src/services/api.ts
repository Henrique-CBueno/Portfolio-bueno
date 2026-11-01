// API pública do portfólio (sem login): o que o site lê e manda no navegador do visitante.
import type { Contagem, Snapshot } from '../lib/tipos';
import type { Erros, Valores } from '../lib/contato';

/** Endereço da API, do .env (PUBLIC_API_URL). Sem ele, toda chamada falha com ApiIndisponivel. */
const enderecoDaApi = () => import.meta.env.PUBLIC_API_URL;

export class ApiIndisponivel extends Error {
	constructor(motivo: string) {
		super(`API indisponível: ${motivo}`);
	}
}

function url(caminho: string) {
	const api = enderecoDaApi();
	if (!api) throw new ApiIndisponivel('PUBLIC_API_URL não definido');
	return new URL(caminho, api);
}

/**
 * Vídeos, contagens, repositórios e destaques (GET /snapshot). As capas vêm como caminho da API (/capas/<id>)
 * e saem daqui como endereço completo.
 */
export async function buscarSnapshot(): Promise<Snapshot> {
	const resposta = await fetch(url('/snapshot'), { signal: AbortSignal.timeout(10_000) });
	if (!resposta.ok) throw new ApiIndisponivel(`HTTP ${resposta.status} em /snapshot`);
	const s = (await resposta.json()) as Snapshot;
	const videos = s.videos.map((v) => ({ ...v, capa: url(v.capa as string).href }));
	return { ...s, videos, repositorios: s.repositorios ?? [] };
}

export type ResultadoDoContato = { tipo: 'enviada' } | { tipo: 'invalida'; erros: Erros } | { tipo: 'limite' };

/** POST /contato. Erro de rede ou da API (5xx) vira exceção; o resto vira um resultado que a tela sabe mostrar. */
export async function enviarContato(valores: Valores): Promise<ResultadoDoContato> {
	const resposta = await fetch(url('/contato'), {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ nome: valores.nome.trim(), email: valores.email.trim(), assunto: valores.assunto.trim(), mensagem: valores.mensagem.trim() }),
	});
	if (resposta.status === 429) return { tipo: 'limite' };
	if (resposta.status === 400) {
		const corpo = (await resposta.json().catch(() => ({}))) as { erros?: Erros };
		return { tipo: 'invalida', erros: corpo.erros ?? {} };
	}
	if (!resposta.ok) throw new ApiIndisponivel(`HTTP ${resposta.status} em /contato`);
	return { tipo: 'enviada' };
}

/**
 * Contagens ao vivo (SSE em /stream): `aoReceber` a cada número novo (e logo ao conectar), `aoCair` quando a
 * conexão falha (o navegador tenta reconectar sozinho). Devolve como desligar. Sem API, não faz nada.
 */
export function acompanharContagens(aoReceber: (contagens: Contagem[]) => void, aoCair: () => void): () => void {
	const api = enderecoDaApi();
	if (!api) return () => {};
	const fonte = new EventSource(new URL('/stream', api));
	fonte.addEventListener('contagens', (evento) => aoReceber(JSON.parse((evento as MessageEvent).data) as Contagem[]));
	fonte.addEventListener('error', aoCair);
	return () => fonte.close();
}
