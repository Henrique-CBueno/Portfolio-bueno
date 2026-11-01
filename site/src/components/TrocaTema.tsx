import { useSyncExternalStore } from 'react';
import { Moon, Sun } from 'lucide-react';
import { aplicarTema, assinarTema, temaAtual, type Tema } from '../lib/tema';
import './TrocaTema.css';

/** No servidor (build) não há escolha do visitante: o HTML sai com o padrão, o escuro. */
const temaNoServidor = (): Tema => 'escuro';

/**
 * Botão de tema. O tema vive no <html> (data-tema), fora do React: useSyncExternalStore lê de lá e
 * acompanha as trocas, inclusive de outra aba. O ícone vem do CSS, então nada muda na hidratação.
 */
export function TrocaTema() {
	const tema = useSyncExternalStore(assinarTema, temaAtual, temaNoServidor);
	const proximo: Tema = tema === 'claro' ? 'escuro' : 'claro';
	return (
		<button type="button" className="troca-tema" aria-label={`usar tema ${proximo}`} title={`tema ${proximo}`} onClick={() => aplicarTema(proximo)}>
			<Sun className="sol" aria-hidden="true" />
			<Moon className="lua" aria-hidden="true" />
		</button>
	);
}
