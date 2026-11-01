import { useEffect, useState } from 'react';
import { entrar, keycloak } from './api';
import { Numeros } from './Numeros';
import { FalhaApi } from '../components/FalhaApi';

type Fase = { tipo: 'entrando' } | { tipo: 'sem-login' } | { tipo: 'aviso'; texto: string } | { tipo: 'pronto' };

export function Painel() {
	const [fase, setFase] = useState<Fase>({ tipo: 'entrando' });
	const [usuario, setUsuario] = useState<string>();

	useEffect(() => {
		(async () => {
			try {
				await entrar();
			} catch {
				setFase({ tipo: 'sem-login' });
				return;
			}
			setUsuario(String(keycloak.tokenParsed?.preferred_username ?? ''));
			if (!keycloak.hasRealmRole('admin')) {
				setFase({ tipo: 'aviso', texto: 'sua conta entrou, mas não tem o papel "admin" no Keycloak.' });
				return;
			}
			setFase({ tipo: 'pronto' });
		})();
	}, []);

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
				{fase.tipo === 'sem-login' && <FalhaApi oque="o login" tentarDeNovo={() => location.reload()} />}
				{fase.tipo === 'aviso' && <p className="aviso">{fase.texto}</p>}
				{fase.tipo === 'pronto' && (
					<>
						<Numeros />
						<section className="bloco">
							<div className="cab-bloco"><h2>Vídeos</h2></div>
							<p className="dica">Os vídeos vêm dos Reels do Instagram: título da primeira linha da legenda, categoria da hashtag (#resiliencia, #concorrencia, #consistencia, #seguranca, #arquitetura). O site se atualiza sozinho alguns minutos depois de postar.</p>
						</section>
					</>
				)}
			</main>
		</>
	);
}
