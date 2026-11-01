import type { Snapshot } from '../lib/tipos';
import { imagem } from '../lib/imagem';
import circuitBreakerPicture from '../assets/videos/circuit-breaker.jpg?w=300;540&format=webp&as=picture';
import fencingPicture from '../assets/videos/fencing.jpg?w=300;540&format=webp&as=picture';
import urnaPicture from '../assets/videos/urna.jpg?w=300;540&format=webp&as=picture';
import virtualThreadsPicture from '../assets/videos/virtual-threads.jpg?w=300;540&format=webp&as=picture';

/**
 * Dados de exemplo enquanto a API não existe. Títulos e capas são reais;
 * datas e contagens são ilustrativas.
 */
export const exemplo: Snapshot = {
	lidoEm: '2026-10-22T12:00:00-03:00',
	videos: [
		{ titulo: '1 API lenta derrubou tudo', link: 'https://www.instagram.com/bueno_dev/', capa: imagem(circuitBreakerPicture), publicadoEm: '2026-10-20T18:00:00-03:00', categoria: 'resiliencia' },
		{ titulo: '1 assento vendido 2 vezes', link: 'https://www.instagram.com/bueno_dev/', capa: imagem(fencingPicture), publicadoEm: '2026-10-17T18:00:00-03:00', categoria: 'consistencia' },
		{ titulo: 'Como provar que ninguém mexeu?', link: 'https://www.instagram.com/bueno_dev/', capa: imagem(urnaPicture), publicadoEm: '2026-10-14T18:00:00-03:00', categoria: 'seguranca' },
		{ titulo: 'CPU em 5% e travado', link: 'https://www.instagram.com/bueno_dev/', capa: imagem(virtualThreadsPicture), publicadoEm: '2026-10-08T18:00:00-03:00', categoria: 'concorrencia' },
	],
	contagens: [
		{ rede: 'instagram', valor: 1284, manual: true, atualizadoEm: '2026-10-20T12:00:00-03:00' },
		{ rede: 'tiktok', valor: null },
		{ rede: 'youtube', valor: 96, aproximado: true },
	],
};
