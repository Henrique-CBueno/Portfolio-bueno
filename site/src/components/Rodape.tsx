import { perfil } from '../dados/perfil';
import './Rodape.css';

export function Rodape({ geradoEm }: { geradoEm: string }) {
	return (
		<footer className="rodape">
			<span>
				{perfil.nome} · {perfil.handle}
			</span>
			<span>© {new Date(geradoEm).getFullYear()} · feito com React, no mesmo visual dos vídeos</span>
		</footer>
	);
}
