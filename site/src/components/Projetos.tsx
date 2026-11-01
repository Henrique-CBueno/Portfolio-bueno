import { Link } from 'react-router';
import { ArrowRight, ArrowUpRight, RotateCw } from 'lucide-react';
import { Diagrama } from './Diagrama';
import { Img } from './Img';
import { Indicador } from './Indicador';
import { Marca } from './Marca';
import { Pill } from './Pill';
import { Titulo } from './Titulo';
import { destaques } from '../dados/projetos';
import { redes } from '../dados/perfil';
import { useCarrossel } from '../hooks/useCarrossel';
import { caminhoDoProjeto } from '../lib/cabecalho';
import { tempoRelativo } from '../lib/formato';
import type { Carga } from '../hooks/useSnapshot';
import type { Repositorio, Snapshot } from '../lib/tipos';
import './Projetos.css';

/** Cor no formato #rrggbb (o que vem da API vira estilo, então só isso passa). */
const corValida = (cor?: string | null) => !!cor && /^#[0-9a-f]{6}$/i.test(cor);

/** Só links http(s) viram href (o que vem da API passa por aqui). */
const seguro = (link: string) => (/^https?:\/\//.test(link) ? link : undefined);

const emDestaque = new Set(destaques.flatMap((d) => d.links.map((l) => l.href.toLowerCase())));

interface Props { carga: Carga<Snapshot>; tentarDeNovo: () => void }

export function Projetos({ carga, tentarDeNovo }: Props) {
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
						{/* o card abre a página do projeto; o site dele fica nos links de baixo */}
						<Link className="janela" to={caminhoDoProjeto(d.slug)} data-cursor="ver" aria-label={`Ver o projeto ${d.titulo}`}>
							<div className="barra"><i></i><i></i><i></i><span>{d.endereco}</span></div>
							<div className="print" data-print="">
								{d.print && <Img imagem={d.print.imagem} alt={d.print.alt} sizes="(max-width: 960px) 92vw, 600px" data-paralaxe="" />}
								{d.diagrama && <Diagrama {...d.diagrama} />}
							</div>
						</Link>
						<div className="corpo">
							<div className="tags">{d.tags.map((t) => <Pill key={t.nome} cor={t.cor}>{t.nome}</Pill>)}</div>
							<h3>{d.titulo}</h3>
							<p>{d.descricao}</p>
							<div className="links">
								<Link to={caminhoDoProjeto(d.slug)}>detalhes <ArrowRight /></Link>
								{d.links.map((l) => <a key={l.href} href={l.href} target="_blank" rel="noopener noreferrer">{l.rotulo} {l.icone === 'github' ? <Marca rede="github" /> : <ArrowUpRight />}</a>)}
								{d.nota && <small>{d.nota}</small>}
							</div>
						</div>
					</article>
				))}
			</div>
			<Indicador atual={atual} total={destaques.length} />

			<h3 className="subtitulo" data-revela="">Fixados no GitHub</h3>
			<Fixados carga={carga} tentarDeNovo={tentarDeNovo} />
		</section>
	);
}

/** Repositórios fixados, lidos da API no navegador (os que já estão em destaque ficam de fora). */
function Fixados({ carga, tentarDeNovo }: Props) {
	if (carga.estado === 'carregando') {
		return (
			<div className="lista" aria-busy="true">
				<span className="so-leitor" role="status">carregando os repositórios fixados</span>
				{Array.from({ length: 3 }, (_, i) => (
					<div key={i} className="repo esqueleto-repo" aria-hidden="true">
						<div><span className="esqueleto nome"></span><span className="esqueleto chips"></span><span className="esqueleto chips"></span></div>
						<div><span className="esqueleto texto"></span><span className="esqueleto texto curto"></span></div>
						<span className="esqueleto seta"></span>
					</div>
				))}
			</div>
		);
	}
	if (carga.estado === 'erro') {
		return (
			<div className="painel falha chega" role="alert">
				<p><strong>Não deu pra carregar os repositórios agora.</strong>Eles continuam todos no GitHub.</p>
				<div className="redes-vazio">
					<button className="botao" type="button" onClick={tentarDeNovo}>tentar de novo <RotateCw /></button>
					<a className="pill verde" href={redes.github.url} target="_blank" rel="noopener noreferrer">github</a>
				</div>
			</div>
		);
	}
	const outros = (carga.dados.repositorios ?? []).filter((r) => !emDestaque.has(r.url.toLowerCase()));
	if (outros.length === 0) {
		return <p className="sem-repos chega">Nenhum repositório fixado no GitHub agora. <a href={redes.github.url} target="_blank" rel="noopener noreferrer">ver o perfil <ArrowUpRight /></a></p>;
	}
	return (
		<div className="lista">
			{outros.map((r, i) => <Repo key={r.url} repositorio={r} ordem={i} />)}
		</div>
	);
}

function Repo({ repositorio: r, ordem }: { repositorio: Repositorio; ordem: number }) {
	return (
		<a className="repo chega" style={{ animationDelay: `${ordem * 50}ms` }} href={seguro(r.url)} target="_blank" rel="noopener noreferrer" data-cursor="abrir">
			<div>
				<h4>{r.nome}</h4>
				<div className="linguas">
					{r.linguagens.map((l, i) => (
						<span key={l} className="chip">
							{/* a bolinha da linguagem principal, na cor que o GitHub usa */}
							{i === 0 && corValida(r.corLinguagem) && <i className="cor" style={{ background: r.corLinguagem! }} aria-hidden="true"></i>}
							{l}
						</span>
					))}
				</div>
				{r.atualizadoEm && <time className="atualizado" dateTime={r.atualizadoEm}>atualizado {tempoRelativo(new Date(r.atualizadoEm))}</time>}
			</div>
			{r.descricao ? <p>{r.descricao}</p> : <p className="vazio">sem descrição no GitHub</p>}
			<span className="seta"><ArrowUpRight /></span>
		</a>
	);
}
