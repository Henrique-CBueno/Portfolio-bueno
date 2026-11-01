import { useEffect, useRef, useState } from 'react';
import { animate } from 'motion';
import { Link, useLocation } from 'react-router';
import { movimentoReduzido } from '../lib/movimento-reduzido';
import { TrocaTema } from './TrocaTema';
import './Topo.css';

const secoes = [
	['sobre', 'sobre'],
	['videos', 'vídeos'],
	['projetos', 'projetos'],
	['stacks', 'stacks'],
	['premiacoes', 'premiações'],
	['contato', 'contato'],
] as const;

export function Topo() {
	const { pathname } = useLocation();
	const [rolou, setRolou] = useState(false);
	const [ativa, setAtiva] = useState<string | null>(null);
	const links = useRef(new Map<string, HTMLAnchorElement>());
	const marcador = useRef<HTMLSpanElement>(null);

	/* fundo ao rolar */
	useEffect(() => {
		const aoRolar = () => setRolou(scrollY > 8);
		addEventListener('scroll', aoRolar, { passive: true });
		aoRolar();
		return () => removeEventListener('scroll', aoRolar);
	}, []);

	/* seção atual: só existe no início; em outra página nenhum link fica marcado */
	useEffect(() => {
		setAtiva(null);
		if (pathname !== '/') return;
		const margem = { rootMargin: '-45% 0px -50% 0px' };
		const observador = new IntersectionObserver((entradas) => {
			for (const e of entradas) if (e.isIntersecting) setAtiva(e.target.id);
		}, margem);
		secoes.forEach(([id]) => { const s = document.getElementById(id); if (s) observador.observe(s); });
		const inicio = new IntersectionObserver(([e]) => { if (e.isIntersecting) setAtiva(null); }, margem);
		const abertura = document.getElementById('inicio');
		if (abertura) inicio.observe(abertura);
		return () => { observador.disconnect(); inicio.disconnect(); };
	}, [pathname]);

	/* marcador desliza até o link da seção atual */
	useEffect(() => {
		const el = marcador.current;
		if (!el) return;
		const reduzido = movimentoReduzido();
		const link = ativa ? links.current.get(ativa) : undefined;
		if (!link) {
			animate(el, { opacity: 0 }, { duration: reduzido ? 0 : 0.2 });
			return;
		}
		animate(el, { opacity: 1, x: link.offsetLeft, width: link.offsetWidth }, reduzido ? { duration: 0 } : { type: 'spring', bounce: 0.2, duration: 0.5 });
	}, [ativa]);

	return (
		<header className={rolou ? 'topo rolou' : 'topo'}>
			<div className="dentro">
				<Link className="marca" to="/#inicio" aria-label="Henrique Bueno, voltar ao início" data-marca="">
					<span className="tag" aria-hidden="true" data-marca-esq="">&lt;</span><span className="nome" data-marca-nome="">Henrique Bueno</span><span className="tag" aria-hidden="true" data-marca-dir="">/&gt;</span>
				</Link>
				<nav aria-label="Seções">
					{secoes.map(([id, rotulo]) => (
						<Link key={id} to={`/#${id}`} className={ativa === id ? 'ativo' : undefined} ref={(a) => { if (a) links.current.set(id, a); else links.current.delete(id); }}>{rotulo}</Link>
					))}
					<span className="marcador" aria-hidden="true" ref={marcador}></span>
				</nav>
				<TrocaTema />
			</div>
		</header>
	);
}
