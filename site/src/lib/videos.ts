import type { Video } from './tipos';

/** Resume o que o card mostra; o navegador compara com a da API pra saber se precisa redesenhar a lista. */
export function assinatura(videos: Video[]): string {
	return JSON.stringify(videos.map((v) => [v.id, v.titulo, v.link, v.categoria ?? null, v.publicadoEm, typeof v.capa === 'string' ? v.capa : null]));
}
