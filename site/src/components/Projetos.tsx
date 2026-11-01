import { Link } from 'react-router';
import { ArrowRight, ArrowUpRight, RotateCw } from 'lucide-react';
import { Diagrama } from './Diagrama';
import { Img } from './Img';
import { Indicador } from './Indicador';
import { Marca } from './Marca';
import { Pill } from './Pill';
import { Titulo } from './Titulo';
import { redes } from '../dados/perfil';
import { useCarrossel } from '../hooks/useCarrossel';
import { caminhoDoProjeto } from '../lib/cabecalho';
import { tempoRelativo } from '../lib/formato';
import type { Carga } from '../hooks/useSnapshot';
import { enderecosEmDestaque, resolverDestaques, type ItemDestaque } from '../lib/destaques';
import type { Destaque, Repositorio, Snapshot } from '../lib/tipos';
import './Projetos.css';
import { Botao } from './Botao';
import { Card } from './Card';

/** Cor no formato #rrggbb (o que vem da API vira estilo, então só isso passa). */
const corValida = (cor?: string | null) => !!cor && /^#[0-9a-f]{6}$/i.test(cor);

/** Só links http(s) viram href (o que vem da API passa por aqui). */
const seguro = (link: string) => (/^https?:\/\//.test(link) ? link : undefined);

interface Props {
	carga: Carga<Snapshot>;
	tentarDeNovo: () => void;
}

/**
 * Os destaques que a home mostra: a seleção do painel quando a API respondeu; o padrão (os curados) se ela falhou;
 * null enquanto carrega.
 */
function itensDaHome(carga: Carga<Snapshot>): ItemDestaque[] | null {
	if (carga.estado === 'carregando') return null;
	if (carga.estado === 'erro') return resolverDestaques(null, []);
	const { destaques: selecao, publicos, repositorios } = carga.dados;
	// o fixado vem antes: tem o parágrafo do README quando falta descrição, a cor e mais linguagens
	return resolverDestaques(selecao, [...(repositorios ?? []), ...(publicos ?? [])]);
}

export function Projetos({ carga, tentarDeNovo }: Props) {
	const itens = itensDaHome(carga);
	const [lista, atual] = useCarrossel(itens?.length ?? 0);

	return (
		<section className="secao projetos" id="projetos">
			<div className="cab">
				<Titulo antes="Projetos em" destaque="destaque" />
				<a href={redes.github.url} target="_blank" rel="noopener noreferrer" data-revela="">
					ver todo o GitHub <ArrowUpRight />
				</a>
			</div>

			{itens === null && (
				<div className="destaques carrossel" aria-busy="true">
					<span className="so-leitor" role="status">
						carregando os projetos em destaque
					</span>
					{Array.from({ length: 2 }, (_, i) => (
						<Card key={i} className="destaque esqueleto-destaque" aria-hidden="true">
							<div className="janela">
								<div className="barra">
									<i></i>
									<i></i>
									<i></i>
								</div>
								<div className="print esqueleto"></div>
							</div>
							<div className="corpo">
								<span className="esqueleto tags-e"></span>
								<span className="esqueleto titulo-e"></span>
								<span className="esqueleto texto-e"></span>
								<span className="esqueleto texto-e curto"></span>
							</div>
						</Card>
					))}
				</div>
			)}

			{itens?.length === 0 && (
				<p className="sem-repos chega">
					Nenhum projeto em destaque agora.{' '}
					<a href={redes.github.url} target="_blank" rel="noopener noreferrer">
						ver o GitHub <ArrowUpRight />
					</a>
				</p>
			)}

			{itens && itens.length > 0 && (
				<>
					<div className="destaques carrossel" data-carrossel="" ref={lista}>
						{itens.map((item, i) =>
							item.tipo === 'projeto' ? (
								<CardProjeto key={item.chave} projeto={item.projeto} ordem={i} />
							) : (
								<CardRepositorio key={item.chave} repositorio={item.repositorio} ordem={i} />
							),
						)}
					</div>
					<Indicador atual={atual} total={itens.length} />
				</>
			)}

			<h3 className="subtitulo" data-revela="">
				Fixados no GitHub
			</h3>
			<Fixados carga={carga} tentarDeNovo={tentarDeNovo} emDestaque={enderecosEmDestaque(itens ?? [])} />
		</section>
	);
}

/** Projeto curado: print (ou diagrama), tags, texto; o card abre a página dele. */
function CardProjeto({ projeto: d, ordem }: { projeto: Destaque; ordem: number }) {
	return (
		<Card as="article" className={d.largo ? 'destaque largo chega' : 'destaque chega'} style={{ animationDelay: `${ordem * 70}ms` }}>
			{/* o card abre a página do projeto; o site dele fica nos links de baixo */}
			<Link className="janela" to={caminhoDoProjeto(d.slug)} data-cursor="ver" aria-label={`Ver o projeto ${d.titulo}`}>
				<div className="barra">
					<i></i>
					<i></i>
					<i></i>
					<span>{d.endereco}</span>
				</div>
				<div className="print" data-print="">
					{d.print && <Img imagem={d.print.imagem} alt={d.print.alt} sizes="(max-width: 960px) 92vw, 600px" />}
					{d.diagrama && <Diagrama {...d.diagrama} />}
				</div>
			</Link>
			<div className="corpo">
				<div className="tags">
					{d.tags.map((t) => (
						<Pill key={t.nome} cor={t.cor}>
							{t.nome}
						</Pill>
					))}
				</div>
				<h3>{d.titulo}</h3>
				<p>{d.descricao}</p>
				<div className="links">
					<Link to={caminhoDoProjeto(d.slug)}>
						detalhes <ArrowRight />
					</Link>
					{d.links.map((l) => (
						<a key={l.href} href={l.href} target="_blank" rel="noopener noreferrer">
							{l.rotulo} {l.icone === 'github' ? <Marca rede="github" /> : <ArrowUpRight />}
						</a>
					))}
					{d.nota && <small>{d.nota}</small>}
				</div>
			</div>
		</Card>
	);
}

/** Repositório do GitHub em destaque: sem print, a "janela" mostra o próprio repo; o card abre o GitHub. */
function CardRepositorio({ repositorio: r, ordem }: { repositorio: Repositorio; ordem: number }) {
	const caminho = r.url.replace(/^https?:\/\//, '');
	return (
		<Card as="article" className="destaque chega" style={{ animationDelay: `${ordem * 70}ms` }}>
			<a className="janela" href={seguro(r.url)} target="_blank" rel="noopener noreferrer" data-cursor="abrir" aria-label={`Abrir ${r.nome} no GitHub`}>
				<div className="barra">
					<i></i>
					<i></i>
					<i></i>
					<span>{caminho}</span>
				</div>
				<div className="print capa-repo">
					<Marca rede="github" className="logo" />
					<strong>{r.nome}</strong>
					{r.linguagens[0] && (
						<span className="linguagem">
							{corValida(r.corLinguagem) && <i style={{ background: r.corLinguagem! }} aria-hidden="true"></i>}
							{r.linguagens[0]}
						</span>
					)}
				</div>
			</a>
			<div className="corpo">
				<div className="tags">
					{r.linguagens.map((l) => (
						<Pill key={l}>{l}</Pill>
					))}
				</div>
				<h3>{r.nome}</h3>
				{r.descricao ? <p>{r.descricao}</p> : <p className="vazio">sem descrição no GitHub</p>}
				<div className="links">
					<a href={seguro(r.url)} target="_blank" rel="noopener noreferrer">
						ver no GitHub <Marca rede="github" />
					</a>
					{r.atualizadoEm && <small>atualizado {tempoRelativo(new Date(r.atualizadoEm))}</small>}
				</div>
			</div>
		</Card>
	);
}

/** Repositórios fixados, lidos da API no navegador (os que já estão em destaque ficam de fora). */
function Fixados({ carga, tentarDeNovo, emDestaque }: Props & { emDestaque: Set<string> }) {
	if (carga.estado === 'carregando') {
		return (
			<div className="lista" aria-busy="true">
				<span className="so-leitor" role="status">
					carregando os repositórios fixados
				</span>
				{Array.from({ length: 3 }, (_, i) => (
					<div key={i} className="repo esqueleto-repo" aria-hidden="true">
						<div>
							<span className="esqueleto nome"></span>
							<span className="esqueleto chips"></span>
							<span className="esqueleto chips"></span>
						</div>
						<div>
							<span className="esqueleto texto"></span>
							<span className="esqueleto texto curto"></span>
						</div>
						<span className="esqueleto seta"></span>
					</div>
				))}
			</div>
		);
	}
	if (carga.estado === 'erro') {
		return (
			<Card className="falha chega" role="alert">
				<p>
					<strong>Não deu pra carregar os repositórios agora.</strong>Eles continuam todos no GitHub.
				</p>
				<div className="redes-vazio">
					<Botao type="button" onClick={tentarDeNovo}>
						tentar de novo <RotateCw />
					</Botao>
					<a className="pill verde" href={redes.github.url} target="_blank" rel="noopener noreferrer">
						github
					</a>
				</div>
			</Card>
		);
	}
	const outros = (carga.dados.repositorios ?? []).filter((r) => !emDestaque.has(r.url.toLowerCase()));
	if (outros.length === 0) {
		return (
			<p className="sem-repos chega">
				Nenhum repositório fixado no GitHub agora.{' '}
				<a href={redes.github.url} target="_blank" rel="noopener noreferrer">
					ver o perfil <ArrowUpRight />
				</a>
			</p>
		);
	}
	return (
		<div className="lista">
			{outros.map((r, i) => (
				<Repo key={r.url} repositorio={r} ordem={i} />
			))}
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
				{r.atualizadoEm && (
					<time className="atualizado" dateTime={r.atualizadoEm}>
						atualizado {tempoRelativo(new Date(r.atualizadoEm))}
					</time>
				)}
			</div>
			{r.descricao ? <p>{r.descricao}</p> : <p className="vazio">sem descrição no GitHub</p>}
			<span className="seta">
				<ArrowUpRight />
			</span>
		</a>
	);
}
