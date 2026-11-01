import { useEffect, useState } from 'react';
import { api, chamar, dataBR } from './api';
import { categoria as infoCategoria } from '../lib/categorias';
import type { Video } from '../lib/tipos';

interface Props {
	videos: Video[];
	aoEditar: (v: Video) => void;
	aoApagar: (v: Video) => Promise<void>;
}

function Item({ video: v, aoEditar, aoApagar }: { video: Video } & Omit<Props, 'videos'>) {
	const [confirmar, setConfirmar] = useState(false);
	const [apagando, setApagando] = useState(false);
	const cat = infoCategoria(v.categoria);

	// apagar em dois toques, sem janela de confirmação do navegador
	useEffect(() => {
		if (!confirmar) return;
		const volta = setTimeout(() => setConfirmar(false), 3000);
		return () => clearTimeout(volta);
	}, [confirmar]);

	async function apagar() {
		if (!confirmar) { setConfirmar(true); return; }
		setApagando(true);
		await chamar(`/videos/${v.id}`, { method: 'DELETE' });
		await aoApagar(v);
	}

	return (
		<article className="item">
			<img src={`${api}${v.capa}`} alt="" loading="lazy" />
			<strong>{v.titulo}</strong>
			<div className="meta">{cat && <span className={`pill ${cat.cor}`}>{cat.nome}</span>}<span>{dataBR.format(new Date(v.publicadoEm))}</span></div>
			<div className="acoes">
				<button type="button" onClick={() => aoEditar(v)}>editar</button>
				<button type="button" className={confirmar ? 'confirmar' : undefined} disabled={apagando} onClick={apagar}>{confirmar ? 'confirmar?' : 'apagar'}</button>
			</div>
		</article>
	);
}

export function ListaVideos({ videos, aoEditar, aoApagar }: Props) {
	return (
		<section className="bloco">
			<div className="cab-bloco"><h2>Vídeos <em>{videos.length}</em></h2><small className="dica">o site se atualiza sozinho uns segundos depois de cada mudança</small></div>
			<div className="lista">
				{videos.length === 0
					? <p className="vazio">nenhum vídeo ainda: o primeiro vai aparecer aqui e no site.</p>
					: videos.map((v) => <Item key={v.id} video={v} aoEditar={aoEditar} aoApagar={aoApagar} />)}
			</div>
		</section>
	);
}
