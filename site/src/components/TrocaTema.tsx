import { useEffect, useState } from 'react';
import { Moon, Sun } from 'lucide-react';
import { aplicarTema, CHAVE_TEMA, temaAtual, type Tema } from '../lib/tema';
import './TrocaTema.css';

/**
 * Botão de tema. O ícone vem do CSS (pelo data-tema do <html>), não do estado: o HTML do build não sabe a
 * escolha do visitante, e assim nada muda na hidratação.
 */
export function TrocaTema() {
	const [tema, setTema] = useState<Tema>('escuro');

	useEffect(() => {
		setTema(temaAtual());
		// outra aba trocou: acompanha
		const aoMudar = (e: StorageEvent) => {
			if (e.key !== CHAVE_TEMA) return;
			const novo: Tema = e.newValue === 'claro' ? 'claro' : 'escuro';
			aplicarTema(novo, false);
			setTema(novo);
		};
		addEventListener('storage', aoMudar);
		return () => removeEventListener('storage', aoMudar);
	}, []);

	const proximo: Tema = tema === 'claro' ? 'escuro' : 'claro';
	return (
		<button
			type="button"
			className="troca-tema"
			aria-label={`usar tema ${proximo}`}
			title={`tema ${proximo}`}
			onClick={() => { aplicarTema(proximo); setTema(proximo); }}
		>
			<Sun className="sol" aria-hidden="true" />
			<Moon className="lua" aria-hidden="true" />
		</button>
	);
}
