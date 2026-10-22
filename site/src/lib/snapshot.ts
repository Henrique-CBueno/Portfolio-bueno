import type { Snapshot } from './tipos';
import { exemplo } from '../dados/exemplo';

/**
 * Últimos números e vídeos gravados no build. Com API_URL definido, lê da API
 * (que consulta Instagram e YouTube); sem ela, usa os dados de exemplo.
 */
export async function carregarSnapshot(): Promise<Snapshot> {
	// no build do Docker vem API_URL (rede interna); no "npm run dev" o Astro só entrega as
	// variáveis PUBLIC_ do .env.development, então usa o endereço público da API
	const api = import.meta.env.API_URL ?? import.meta.env.PUBLIC_API_URL;
	if (!api) return exemplo;
	let resposta: Response;
	try {
		resposta = await fetch(new URL('/snapshot', api));
		if (!resposta.ok) throw new Error(`API respondeu ${resposta.status} em /snapshot`);
	} catch (erro) {
		// no "npm run dev" sem o docker compose de pé, segue com os dados de exemplo
		if (import.meta.env.DEV) {
			console.warn(`[snapshot] API em ${api} fora do ar (${erro}); usando dados de exemplo`);
			return exemplo;
		}
		throw erro;
	}
	const snapshot = (await resposta.json()) as Snapshot;
	// a API devolve a capa como caminho dela mesma (/capas/<id>.jpg)
	snapshot.videos = snapshot.videos.map((v) => ({ ...v, capa: new URL(v.capa as string, api).href }));
	return snapshot;
}
