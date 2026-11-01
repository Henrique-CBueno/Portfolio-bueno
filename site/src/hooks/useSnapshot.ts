import { useCallback, useEffect, useState } from 'react';
import { buscarSnapshot } from '../services/api';
import type { Snapshot } from '../lib/tipos';

/** Estado de um dado que vem da API: o que a tela mostra em cada caso. */
export type Carga<T> = { estado: 'carregando' } | { estado: 'erro' } | { estado: 'pronto'; dados: T };

/**
 * Vídeos, contagens, repositórios e destaques, lidos da API a cada visita. O site é estático: no HTML vem só o
 * esqueleto; aqui ele vira dado, erro ou lista vazia. `tentarDeNovo` refaz a leitura.
 */
export function useSnapshot() {
	const [carga, setCarga] = useState<Carga<Snapshot>>({ estado: 'carregando' });
	const [tentativa, setTentativa] = useState(0);

	useEffect(() => {
		let ativo = true;
		buscarSnapshot()
			.then((dados) => {
				if (ativo) setCarga({ estado: 'pronto', dados });
			})
			.catch(() => {
				if (ativo) setCarga({ estado: 'erro' });
			});
		return () => {
			ativo = false;
		};
	}, [tentativa]);

	const tentarDeNovo = useCallback(() => {
		setCarga({ estado: 'carregando' });
		setTentativa((n) => n + 1);
	}, []);
	return { carga, tentarDeNovo };
}
