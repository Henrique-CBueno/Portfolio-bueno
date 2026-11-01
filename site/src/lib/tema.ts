/**
 * Tema claro/escuro do visitante. O escuro é o padrão (a cara dos vídeos); quem escolhe o claro volta no claro.
 * A escolha fica no localStorage ("tema"); o script no <head> do index.html a aplica antes de desenhar a página,
 * então não pisca o tema errado. Sem localStorage (aba anônima, bloqueado), vale o escuro e a troca dura a visita.
 */
export type Tema = 'escuro' | 'claro';

export const CHAVE_TEMA = 'tema';
/** Avisado a cada troca nesta aba (o 'storage' só avisa as outras abas). */
const EVENTO = 'troca-de-tema';
const COR_DA_BARRA: Record<Tema, string> = { escuro: '#0B0F17', claro: '#F4F1EA' };

export function temaAtual(): Tema {
	return document.documentElement.dataset.tema === 'claro' ? 'claro' : 'escuro';
}

export function aplicarTema(tema: Tema, guardar = true) {
	const raiz = document.documentElement;
	if (tema === 'claro') raiz.dataset.tema = 'claro';
	else delete raiz.dataset.tema;
	document.querySelector('meta[name="theme-color"]')?.setAttribute('content', COR_DA_BARRA[tema]);
	dispatchEvent(new Event(EVENTO));
	if (!guardar) return;
	try {
		localStorage.setItem(CHAVE_TEMA, tema);
	} catch {
		// sem armazenamento: vale só pra esta visita
	}
}

/**
 * Pro useSyncExternalStore: avisa quando o tema muda, nesta aba ou em outra (aí aplica aqui também).
 * Devolve como parar de ouvir.
 */
export function assinarTema(aoMudar: () => void) {
	const deOutraAba = (e: StorageEvent) => {
		if (e.key !== CHAVE_TEMA) return;
		aplicarTema(e.newValue === 'claro' ? 'claro' : 'escuro', false);
	};
	addEventListener(EVENTO, aoMudar);
	addEventListener('storage', deOutraAba);
	return () => {
		removeEventListener(EVENTO, aoMudar);
		removeEventListener('storage', deOutraAba);
	};
}
