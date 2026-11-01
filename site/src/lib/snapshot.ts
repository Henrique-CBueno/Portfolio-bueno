import type { Dados, Snapshot } from './tipos';
import { exemplo } from '../dados/exemplo';
import { assinatura, ULTIMOS } from './videos';

/**
 * Lê o snapshot da API pra gravar na página (roda no build e no dev, nunca no navegador).
 * Com API_URL (rede interna, no Docker) ou PUBLIC_API_URL, lê da API; sem nenhuma, usa os dados de exemplo.
 */
export async function carregarDados(): Promise<Dados> {
	const geradoEm = new Date().toISOString();
	const api = process.env.API_URL ?? import.meta.env.PUBLIC_API_URL;
	if (!api) return { geradoEm, snapshot: exemplo, assinatura: assinatura(exemplo.videos.slice(0, ULTIMOS)) };
	let resposta: Response;
	try {
		resposta = await fetch(new URL('/snapshot', api));
		if (!resposta.ok) throw new Error(`API respondeu ${resposta.status} em /snapshot`);
	} catch (erro) {
		// no "npm run dev" sem o docker compose de pé, segue com os dados de exemplo
		if (import.meta.env.DEV) {
			console.warn(`[snapshot] API em ${api} fora do ar (${erro}); usando dados de exemplo`);
			return { geradoEm, snapshot: exemplo, assinatura: assinatura(exemplo.videos.slice(0, ULTIMOS)) };
		}
		throw erro;
	}
	const snapshot = (await resposta.json()) as Snapshot;
	snapshot.videos = snapshot.videos.slice(0, ULTIMOS);
	const assinado = assinatura(snapshot.videos);
	// a API devolve a capa como caminho dela mesma (/capas/<id>); o prerender baixa daqui
	snapshot.videos = snapshot.videos.map((v) => ({ ...v, capa: new URL(v.capa as string, api).href }));
	return { geradoEm, snapshot, assinatura: assinado };
}
