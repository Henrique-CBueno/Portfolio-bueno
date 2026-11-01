import { useEffect, useState } from 'react';
import { ArrowUpRight } from 'lucide-react';
import { Img } from './Img';
import { Indicador } from './Indicador';
import { Pill } from './Pill';
import { Titulo } from './Titulo';
import { redes } from '../dados/perfil';
import { categoria } from '../lib/categorias';
import { tempoRelativo } from '../lib/formato';
import { assinatura, ULTIMOS } from '../lib/videos';
import { useCarrossel } from '../hooks/useCarrossel';
import type { Snapshot, Video } from '../lib/tipos';
import './Videos.css';

interface Props { videos: Video[]; assinatura: string; geradoEm: string; daApi: Snapshot | null }

/** Só links http(s) viram href (o que vem da API passa por aqui). */
const seguro = (link: string) => (/^https?:\/\//.test(link) ? link : undefined);

export function Videos({ videos: doBuild, assinatura: assinaturaDoBuild, geradoEm, daApi }: Props) {
	const [videos, setVideos] = useState(() => doBuild.slice(0, ULTIMOS));
	// lista trocada depois do carregamento: os cards novos já entram visíveis
	const [trocou, setTrocou] = useState(false);
	// datas relativas: no primeiro desenho, as do build (igual ao HTML); depois, as de agora
	const [agora, setAgora] = useState(() => new Date(geradoEm));
	const [lista, atual] = useCarrossel(videos.length);

	useEffect(() => setAgora(new Date()), []);

	// O HTML traz os vídeos do último build; a lista atual da API entra no lugar se mudou,
	// pra um Reel novo aparecer sem esperar um novo build do site.
	useEffect(() => {
		const api = import.meta.env.PUBLIC_API_URL;
		if (!daApi || !api) return;
		const novos = daApi.videos.slice(0, ULTIMOS);
		if (assinatura(novos) === assinaturaDoBuild) return;
		setVideos(novos.map((v) => ({ ...v, capa: new URL(v.capa as string, api).href })));
		setTrocou(true);
		if (lista.current) lista.current.scrollLeft = 0;
	}, [daApi, assinaturaDoBuild, lista]);

	const visivel = trocou ? { opacity: 1 } : undefined;

	return (
		<section className="secao secao-videos" id="videos">
			<div className="cab">
				<Titulo antes="Últimos" destaque="vídeos" />
				<a href={redes.instagram.url} target="_blank" rel="noopener noreferrer" data-revela="">ver todos no Instagram <ArrowUpRight /></a>
			</div>
			<div className="painel vazio" data-revela="" hidden={videos.length > 0} style={visivel}>
				<p>Os vídeos novos aparecem aqui. Enquanto isso, assista nas redes:</p>
				<div className="redes-vazio">
					<a className="pill roxo" href={redes.instagram.url} target="_blank" rel="noopener noreferrer">instagram</a>
					<a className="pill azul" href={redes.tiktok.url} target="_blank" rel="noopener noreferrer">tiktok</a>
					<a className="pill vermelho" href={redes.youtube.url} target="_blank" rel="noopener noreferrer">youtube</a>
				</div>
			</div>
			<div className="videos carrossel" data-carrossel="" data-grupo="" ref={lista}>
				{videos.map((v) => {
					const cat = categoria(v.categoria);
					return (
						<a key={v.id ?? v.titulo} className="video" href={seguro(v.link)} target="_blank" rel="noopener noreferrer" data-cursor="assistir" style={visivel}>
							<div className="capa">
								{typeof v.capa === 'string'
									? <img src={v.capa} alt="" width={540} height={960} loading="lazy" decoding="async" />
									: <Img imagem={v.capa} alt="" sizes="(max-width: 960px) 45vw, 290px" />}
							</div>
							<h3>{v.titulo}</h3>
							<div className="info">
								{cat && <Pill cor={cat.cor}>{cat.nome}</Pill>}
								<time dateTime={v.publicadoEm}>{tempoRelativo(new Date(v.publicadoEm), agora)}</time>
							</div>
						</a>
					);
				})}
			</div>
			{videos.length > 0 && <Indicador atual={atual} total={videos.length} />}
		</section>
	);
}
