import type { Snapshot } from '../lib/tipos';
import circuitBreaker from '../assets/videos/circuit-breaker.jpg';
import fencing from '../assets/videos/fencing.jpg';
import urna from '../assets/videos/urna.jpg';
import virtualThreads from '../assets/videos/virtual-threads.jpg';

/**
 * Dados de exemplo enquanto a API não existe. Títulos e capas são reais;
 * datas e contagens são ilustrativas.
 */
export const exemplo: Snapshot = {
	lidoEm: '2026-10-22T12:00:00-03:00',
	videos: [
		{ titulo: '1 API lenta derrubou tudo', link: 'https://www.instagram.com/bueno_dev/', capa: circuitBreaker, publicadoEm: '2026-10-20T18:00:00-03:00', categoria: 'resiliencia' },
		{ titulo: '1 assento vendido 2 vezes', link: 'https://www.instagram.com/bueno_dev/', capa: fencing, publicadoEm: '2026-10-17T18:00:00-03:00', categoria: 'consistencia' },
		{ titulo: 'Como provar que ninguém mexeu?', link: 'https://www.instagram.com/bueno_dev/', capa: urna, publicadoEm: '2026-10-14T18:00:00-03:00', categoria: 'seguranca' },
		{ titulo: 'CPU em 5% e travado', link: 'https://www.instagram.com/bueno_dev/', capa: virtualThreads, publicadoEm: '2026-10-08T18:00:00-03:00', categoria: 'concorrencia' },
	],
	contagens: [
		{ rede: 'instagram', valor: 1284, manual: true, atualizadoEm: '2026-10-20T12:00:00-03:00' },
		{ rede: 'tiktok', valor: null },
		{ rede: 'youtube', valor: 96, aproximado: true },
	],
};
