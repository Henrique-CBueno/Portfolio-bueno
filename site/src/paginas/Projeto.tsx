import { Link, useParams } from 'react-router';
import { ArrowLeft, ArrowRight, ArrowUpRight } from 'lucide-react';
import { Diagrama } from '../components/Diagrama';
import { Img } from '../components/Img';
import { Marca } from '../components/Marca';
import { Pill } from '../components/Pill';
import { Titulo } from '../components/Titulo';
import { NaoEncontrada } from './NaoEncontrada';
import { destaques } from '../dados/projetos';
import { caminhoDoProjeto } from '../lib/cabecalho';
import { usePaginaAnimada } from '../hooks/usePaginaAnimada';
import type { Destaque } from '../lib/tipos';
import './Projeto.css';

/** /projetos/:slug — slug que não existe cai no 404. */
export function Projeto() {
	const { slug } = useParams();
	const projeto = destaques.find((d) => d.slug === slug);
	// key: trocar de um projeto pro outro remonta a página e refaz as animações
	return projeto ? <PaginaDoProjeto key={projeto.slug} projeto={projeto} /> : <NaoEncontrada />;
}

function PaginaDoProjeto({ projeto: d }: { projeto: Destaque }) {
	const raiz = usePaginaAnimada();
	const outros = destaques.filter((o) => o.slug !== d.slug);

	return (
		<main ref={raiz} className="pagina-projeto">
			<article className="secao">
				<Link className="voltar" to="/#projetos" data-revela="">
					<ArrowLeft /> todos os projetos
				</Link>

				<header className="cabeca">
					<div className="tags" data-grupo="">{d.tags.map((t) => <Pill key={t.nome} cor={t.cor}>{t.nome}</Pill>)}</div>
					<Titulo tag="h1" antes={d.titulo} />
					{d.nota && <p className="nota" data-revela="">{d.nota}</p>}
				</header>

				<div className="painel janela" data-revela="">
					<div className="barra"><i></i><i></i><i></i><span>{d.endereco}</span></div>
					<div className="print" data-print="">
						{d.print && <Img imagem={d.print.imagem} alt={d.print.alt} sizes="(max-width: 960px) 92vw, 1216px" loading="eager" fetchPriority="high" />}
						{d.diagrama && <Diagrama {...d.diagrama} />}
					</div>
				</div>

				<div className="corpo">
					<p className="descricao" data-revela="">{d.descricao}</p>
					<div className="links" data-revela="">
						{d.links.map((l) => (
							<a key={l.href} className={l === d.links[0] ? 'botao primario' : 'botao'} href={l.href} target="_blank" rel="noopener noreferrer">
								{l.rotulo} {l.icone === 'github' ? <Marca rede="github" /> : <ArrowUpRight />}
							</a>
						))}
					</div>
				</div>
			</article>

			{outros.length > 0 && (
				<section className="secao outros" aria-labelledby="outros-projetos">
					<h2 className="subtitulo" id="outros-projetos" data-revela="">Outros projetos</h2>
					<div className="lista-outros" data-grupo="">
						{outros.map((o) => (
							<Link key={o.slug} className="painel outro" to={caminhoDoProjeto(o.slug)} data-cursor="ver">
								<span><strong>{o.titulo}</strong><small>{o.endereco}</small></span>
								<span className="seta"><ArrowRight /></span>
							</Link>
						))}
					</div>
				</section>
			)}
		</main>
	);
}
