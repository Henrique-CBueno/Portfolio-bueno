import { ArrowUpRight } from 'lucide-react';
import { Diagrama } from './Diagrama';
import { Img } from './Img';
import { Indicador } from './Indicador';
import { Marca } from './Marca';
import { Pill } from './Pill';
import { Titulo } from './Titulo';
import { destaques, fixados } from '../dados/projetos';
import { redes } from '../dados/perfil';
import { useCarrossel } from '../hooks/useCarrossel';
import type { Repositorio } from '../lib/tipos';
import './Projetos.css';

const emDestaque = new Set(destaques.flatMap((d) => d.links.map((l) => l.href.toLowerCase())));

export function Projetos({ repositorios }: { repositorios?: Repositorio[] }) {
	const outros = (repositorios ?? fixados).filter((r) => !emDestaque.has(r.url.toLowerCase()));
	const [lista, atual] = useCarrossel(destaques.length);

	return (
		<section className="secao projetos" id="projetos">
			<div className="cab">
				<Titulo antes="Projetos em" destaque="destaque" />
				<a href={redes.github.url} target="_blank" rel="noopener noreferrer" data-revela="">ver todo o GitHub <ArrowUpRight /></a>
			</div>

			<div className="destaques carrossel" data-carrossel="" data-grupo="" ref={lista}>
				{destaques.map((d) => (
					<article key={d.titulo} className={d.largo ? 'painel destaque largo' : 'painel destaque'}>
						<a className="janela" href={d.links[0].href} target="_blank" rel="noopener noreferrer" data-cursor="abrir" aria-label={`${d.links[0].rotulo}: ${d.titulo}`}>
							<div className="barra"><i></i><i></i><i></i><span>{d.endereco}</span></div>
							<div className="print" data-print="">
								{d.print && <Img imagem={d.print.imagem} alt={d.print.alt} sizes="(max-width: 960px) 92vw, 600px" data-paralaxe="" />}
								{d.diagrama && <Diagrama {...d.diagrama} />}
							</div>
						</a>
						<div className="corpo">
							<div className="tags">{d.tags.map((t) => <Pill key={t.nome} cor={t.cor}>{t.nome}</Pill>)}</div>
							<h3>{d.titulo}</h3>
							<p>{d.descricao}</p>
							<div className="links">
								{d.links.map((l) => <a key={l.href} href={l.href} target="_blank" rel="noopener noreferrer">{l.rotulo} {l.icone === 'github' ? <Marca rede="github" /> : <ArrowUpRight />}</a>)}
								{d.nota && <small>{d.nota}</small>}
							</div>
						</div>
					</article>
				))}
			</div>
			<Indicador atual={atual} total={destaques.length} />

			{outros.length > 0 && (
				<>
					<h3 className="subtitulo" data-revela="">Fixados no GitHub</h3>
					<div className="lista" data-grupo="">
						{outros.map((r) => (
							<a key={r.url} className="repo" href={r.url} target="_blank" rel="noopener noreferrer" data-cursor="abrir">
								<div><h4>{r.nome}</h4><div className="linguas">{r.linguagens.map((l) => <span key={l} className="chip">{l}</span>)}</div></div>
								{r.descricao ? <p>{r.descricao}</p> : <p className="vazio">sem descrição no GitHub</p>}
								<span className="seta"><ArrowUpRight /></span>
							</a>
						))}
					</div>
				</>
			)}
		</section>
	);
}
