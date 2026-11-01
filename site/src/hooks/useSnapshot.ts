import { useCallback, useEffect, useState } from 'react';
import type { Snapshot } from '../lib/tipos';

/** Estado de um dado que vem da API: o que a tela mostra em cada caso. */
export type Carga<T> = { estado: 'carregando' } | { estado: 'erro' } | { estado: 'pronto'; dados: T };

/**
 * Vídeos, contagens e repositórios fixados, lidos da API (GET /snapshot) no navegador a cada visita.
 * O site é estático: no HTML vem só o esqueleto; aqui ele vira dado, erro ou lista vazia.
 * As capas vêm como caminho da API (/capas/<id>) e saem daqui como endereço completo.
 */
export function useSnapshot() {
	const [carga, setCarga] = useState<Carga<Snapshot>>({ estado: 'carregando' });
	const [tentativa, setTentativa] = useState(0);

	useEffect(() => {
		const api = import.meta.env.PUBLIC_API_URL;
		if (!api) {
			setCarga({ estado: 'erro' });
			return;
		}
		let ativo = true;
		setCarga({ estado: 'carregando' });
		fetch(new URL('/snapshot', api), { signal: AbortSignal.timeout(10_000) })
			.then((r) => (r.ok ? r.json() : Promise.reject(new Error(`HTTP ${r.status}`))))
			.then((s: Snapshot) => {
				if (!ativo) return;
				const videos = s.videos.map((v) => ({ ...v, capa: new URL(v.capa as string, api).href }));
				setCarga({ estado: 'pronto', dados: { ...s, videos, repositorios: s.repositorios ?? [] } });
			})
			.catch(() => { if (ativo) setCarga({ estado: 'erro' }); });
		return () => { ativo = false; };
	}, [tentativa]);

	const tentarDeNovo = useCallback(() => setTentativa((n) => n + 1), []);
	return { carga, tentarDeNovo };
}
