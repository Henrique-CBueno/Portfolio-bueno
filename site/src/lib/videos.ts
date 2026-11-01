import type { Video } from './tipos';

/**
 * Resume o que o card mostra, a partir dos vídeos como a API entrega (capa = caminho na API).
 * O navegador compara com a do build pra saber se precisa trocar a lista.
 */
export function assinatura(videos: Video[]): string {
	return JSON.stringify(videos.map((v) => [v.id, v.titulo, v.link, v.categoria ?? null, v.publicadoEm, typeof v.capa === 'string' ? v.capa : null]));
}

/** A home mostra só os últimos 8. */
export const ULTIMOS = 8;
