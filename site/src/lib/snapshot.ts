import type { Snapshot } from './tipos';
import { exemplo } from '../dados/exemplo';

/**
 * Últimos números e vídeos gravados no build. Com API_URL definido, lê da API
 * (que consulta Instagram e YouTube); sem ela, usa os dados de exemplo.
 */
export async function carregarSnapshot(): Promise<Snapshot> {
	const api = import.meta.env.API_URL;
	if (!api) return exemplo;
	const resposta = await fetch(new URL('/snapshot', api));
	if (!resposta.ok) throw new Error(`API respondeu ${resposta.status} em /snapshot`);
	return (await resposta.json()) as Snapshot;
}
