import { useEffect, useState } from 'react';
import type { Snapshot } from '../lib/tipos';

/**
 * O snapshot atual da API, lido uma vez quando a página abre. O HTML traz o do último build; com este,
 * vídeos e repositórios fixados que mudaram depois do build aparecem sem esperar um build novo.
 * Nulo enquanto não chegou (ou se a API estiver fora do ar: aí fica o que veio no build).
 */
export function useSnapshotDaApi(): Snapshot | null {
	const [snapshot, setSnapshot] = useState<Snapshot | null>(null);
	useEffect(() => {
		const api = import.meta.env.PUBLIC_API_URL;
		if (!api) return;
		let ativo = true;
		fetch(new URL('/snapshot', api))
			.then((r) => (r.ok ? r.json() : Promise.reject(r.status)))
			.then((s: Snapshot) => { if (ativo) setSnapshot(s); })
			.catch(() => {
				// API fora do ar: fica o que veio no build
			});
		return () => { ativo = false; };
	}, []);
	return snapshot;
}
