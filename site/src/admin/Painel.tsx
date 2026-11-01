import { useCallback, useEffect, useState } from 'react';
import { chamar, entrar, keycloak } from './api';
import { FormVideo } from './FormVideo';
import { ListaVideos } from './ListaVideos';
import { Numeros } from './Numeros';
import type { Video } from '../lib/tipos';

type Fase = { tipo: 'entrando' } | { tipo: 'aviso'; texto: string } | { tipo: 'pronto' };

export function Painel() {
	const [fase, setFase] = useState<Fase>({ tipo: 'entrando' });
	const [usuario, setUsuario] = useState<string>();
	const [categorias, setCategorias] = useState<string[]>([]);
	const [videos, setVideos] = useState<Video[]>([]);
	const [editando, setEditando] = useState<Video | null>(null);

	const carregarVideos = useCallback(async () => {
		setVideos(await (await chamar('/videos')).json());
	}, []);

	useEffect(() => {
		(async () => {
			try {
				await entrar();
			} catch {
				setFase({ tipo: 'aviso', texto: 'não consegui falar com o login (Keycloak). Tente de novo em instantes.' });
				return;
			}
			setUsuario(String(keycloak.tokenParsed?.preferred_username ?? ''));
			if (!keycloak.hasRealmRole('admin')) {
				setFase({ tipo: 'aviso', texto: 'sua conta entrou, mas não tem o papel "admin" no Keycloak.' });
				return;
			}
			const [lista] = await Promise.all([(await chamar('/categorias')).json(), carregarVideos()]);
			setCategorias(lista);
			setFase({ tipo: 'pronto' });
		})();
	}, [carregarVideos]);

	return (
		<>
			<header className="topo">
				<a className="marca" href="/"><span className="tag">&lt;</span><span className="nome">Henrique Bueno</span><span className="tag">/&gt;</span></a>
				<div className="quem">
					<span className="pill amarelo">painel</span>
					<span>{usuario}</span>
					{usuario !== undefined && <button className="botao" type="button" onClick={() => keycloak.logout({ redirectUri: `${location.origin}/` })}>sair</button>}
				</div>
			</header>

			<main className="painel-admin">
				{fase.tipo === 'entrando' && <p className="aviso">entrando…</p>}
				{fase.tipo === 'aviso' && <p className="aviso">{fase.texto}</p>}
				{fase.tipo === 'pronto' && (
					<>
						<FormVideo
							categorias={categorias}
							editando={editando}
							aoSalvar={async () => { setEditando(null); await carregarVideos(); }}
							aoCancelar={() => setEditando(null)}
						/>
						<ListaVideos
							videos={videos}
							aoEditar={setEditando}
							aoApagar={async (v) => { if (editando?.id === v.id) setEditando(null); await carregarVideos(); }}
						/>
						<Numeros />
					</>
				)}
			</main>
		</>
	);
}
