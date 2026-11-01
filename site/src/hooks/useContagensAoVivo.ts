// Contagens ao vivo: a API empurra os números por SSE. Se ela cair, o site
// continua com os números do build e avisa há quanto tempo eles foram lidos.
import { useEffect, useState } from 'react';
import { tempoRelativo } from '../lib/formato';
import type { Contagem } from '../lib/tipos';

export function useContagensAoVivo(iniciais: Contagem[], lidoNoBuild: string) {
	const [contagens, setContagens] = useState(iniciais);
	/** "último valor · há 3 min" enquanto o SSE está fora. */
	const [aviso, setAviso] = useState<string>();

	useEffect(() => {
		const api = import.meta.env.PUBLIC_API_URL;
		if (!api) return;
		let lidoEm = new Date(lidoNoBuild);
		const fonte = new EventSource(new URL('/stream', api));
		fonte.addEventListener('contagens', (evento) => {
			const novas = JSON.parse((evento as MessageEvent).data) as Contagem[];
			lidoEm = new Date();
			setAviso(undefined);
			setContagens((atuais) => {
				const porRede = new Map(atuais.map((c) => [c.rede, c]));
				// sem número a rede continua com o que já mostrava
				for (const c of novas) if (c.valor !== null) porRede.set(c.rede, c);
				return [...porRede.values()];
			});
		});
		fonte.addEventListener('error', () => setAviso(`último valor · ${tempoRelativo(lidoEm)}`));
		return () => fonte.close();
	}, [lidoNoBuild]);

	return [contagens, aviso] as const;
}
