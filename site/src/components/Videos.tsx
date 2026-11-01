import { ArrowUpRight, RotateCw } from 'lucide-react';
import { Img } from './Img';
import { Indicador } from './Indicador';
import { Pill } from './Pill';
import { Titulo } from './Titulo';
import { redes } from '../dados/perfil';
import { categoria } from '../lib/categorias';
import { tempoRelativo } from '../lib/formato';
import { ULTIMOS } from '../lib/videos';
import { useCarrossel } from '../hooks/useCarrossel';
import type { Carga } from '../hooks/useSnapshot';
import type { Snapshot, Video } from '../lib/tipos';
import './Videos.css';
import { Botao } from './Botao';
import { Card } from './Card';

interface Props {
	carga: Carga<Snapshot>;
	tentarDeNovo: () => void;
}

/** Só links http(s) viram href (o que vem da API passa por aqui). */
const seguro = (link: string) => (/^https?:\/\//.test(link) ? link : undefined);

/** Os últimos Reels, lidos da API no navegador: esqueleto → cards, lista vazia ou erro com "tentar de novo". */
export function Videos({ carga, tentarDeNovo }: Props) {
	const videos = carga.estado === 'pronto' ? carga.dados.videos.slice(0, ULTIMOS) : [];
	const [lista, atual] = useCarrossel(carga.estado === 'pronto' ? videos.length : 0);

	return (
		<section className="secao secao-videos" id="videos" aria-busy={carga.estado === 'carregando'}>
			<div className="cab">
				<Titulo antes="Últimos" destaque="vídeos" />
				<a href={redes.instagram.url} target="_blank" rel="noopener noreferrer" data-revela="">
					ver todos no Instagram <ArrowUpRight />
				</a>
			</div>

			{carga.estado === 'carregando' && (
				<div className="videos carrossel">
					<span className="so-leitor" role="status">
						carregando os últimos vídeos
					</span>
					{Array.from({ length: ULTIMOS }, (_, i) => (
						<div key={i} className="video" aria-hidden="true">
							<div className="capa esqueleto"></div>
							<span className="esqueleto linha"></span>
							<span className="esqueleto linha curta"></span>
						</div>
					))}
				</div>
			)}

			{carga.estado === 'erro' && (
				<Card className="falha chega" role="alert">
					<p>
						<strong>Não deu pra carregar os vídeos agora.</strong>Enquanto isso, eles estão todos no Instagram.
					</p>
					<div className="redes-vazio">
						<Botao type="button" onClick={tentarDeNovo}>
							tentar de novo <RotateCw />
						</Botao>
						<a className="pill roxo" href={redes.instagram.url} target="_blank" rel="noopener noreferrer">
							instagram
						</a>
					</div>
				</Card>
			)}

			{carga.estado === 'pronto' && videos.length === 0 && (
				<Card className="vazio chega">
					<p>Os vídeos novos aparecem aqui. Enquanto isso, assista nas redes:</p>
					<div className="redes-vazio">
						<a className="pill roxo" href={redes.instagram.url} target="_blank" rel="noopener noreferrer">
							instagram
						</a>
						<a className="pill azul" href={redes.tiktok.url} target="_blank" rel="noopener noreferrer">
							tiktok
						</a>
						<a className="pill vermelho" href={redes.youtube.url} target="_blank" rel="noopener noreferrer">
							youtube
						</a>
					</div>
				</Card>
			)}

			{carga.estado === 'pronto' && videos.length > 0 && (
				<>
					<div className="videos carrossel" data-carrossel="" ref={lista}>
						{videos.map((v, i) => (
							<CardDoVideo key={v.id ?? v.titulo} video={v} ordem={i} />
						))}
					</div>
					<Indicador atual={atual} total={videos.length} />
				</>
			)}
		</section>
	);
}

function CardDoVideo({ video: v, ordem }: { video: Video; ordem: number }) {
	const cat = categoria(v.categoria);
	return (
		<a
			className="video chega"
			style={{ animationDelay: `${ordem * 60}ms` }}
			href={seguro(v.link)}
			target="_blank"
			rel="noopener noreferrer"
			data-cursor="assistir"
		>
			<div className="capa">
				{typeof v.capa === 'string' ? (
					<img src={v.capa} alt="" width={540} height={960} loading="lazy" decoding="async" />
				) : (
					<Img imagem={v.capa} alt="" sizes="(max-width: 960px) 45vw, 290px" />
				)}
			</div>
			<h3>{v.titulo}</h3>
			<div className="info">
				{cat && <Pill cor={cat.cor}>{cat.nome}</Pill>}
				<time dateTime={v.publicadoEm}>{tempoRelativo(new Date(v.publicadoEm))}</time>
			</div>
		</a>
	);
}
