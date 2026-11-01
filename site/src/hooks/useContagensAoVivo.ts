// Seguidores: chegam com o snapshot da API e depois ao vivo pelo SSE (que também manda os números
// assim que conecta). Se o SSE cair, ficam os últimos números e o aviso de quando foram lidos.
import { useEffect, useState } from 'react';
import { acompanharContagens } from '../services/api';
import { tempoRelativo } from '../lib/formato';
import type { Carga } from './useSnapshot';
import type { Contagem, Snapshot } from '../lib/tipos';

export function useContagensAoVivo(carga: Carga<Snapshot>) {
	const [aoVivo, setAoVivo] = useState<Contagem[] | null>(null);
	/** "último valor · há 3 min" enquanto o SSE está fora. */
	const [aviso, setAviso] = useState<string>();
	const doSnapshot = carga.estado === 'pronto' ? carga.dados : null;

	useEffect(() => {
		let lidoEm: Date | null = null;
		return acompanharContagens(
			(novas) => {
				lidoEm = new Date();
				setAviso(undefined);
				setAoVivo((atuais) => {
					const porRede = new Map((atuais ?? []).map((c) => [c.rede, c]));
					// sem número a rede continua com o que já mostrava
					for (const c of novas) if (c.valor !== null || !porRede.has(c.rede)) porRede.set(c.rede, c);
					return [...porRede.values()];
				});
			},
			() => {
				if (lidoEm) setAviso(`último valor · ${tempoRelativo(lidoEm)}`);
			},
		);
	}, []);

	// o SSE é mais novo que o snapshot; enquanto nenhum dos dois chegou, é null (a tela mostra o esqueleto)
	const contagens = aoVivo ?? doSnapshot?.contagens ?? null;
	return { contagens, aviso };
}
