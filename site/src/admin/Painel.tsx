import { useLogin } from '../hooks/useLogin';
import { Destaques } from './Destaques';
import { Mensagens } from './Mensagens';
import { Numeros } from './Numeros';
import { FalhaApi } from '../components/FalhaApi';
import { TrocaTema } from '../components/TrocaTema';
import { Botao } from '../components/Botao';

/** O painel /admin: só aparece (e só pede dados) depois do login, pra quem tem o papel "admin". */
export function Painel() {
	const { fase, usuario, sair } = useLogin();

	return (
		<>
			<header className="topo">
				<a className="marca" href="/">
					<span className="tag">&lt;</span>
					<span className="nome">Henrique Bueno</span>
					<span className="tag">/&gt;</span>
				</a>
				<div className="quem">
					<TrocaTema />
					<span className="pill amarelo">painel</span>
					<span>{usuario}</span>
					{usuario !== undefined && (
						<Botao type="button" onClick={sair}>
							sair
						</Botao>
					)}
				</div>
			</header>

			<main className="painel-admin">
				{fase === 'entrando' && <p className="aviso">entrando…</p>}
				{fase === 'sem-login' && <FalhaApi oque="o login" tentarDeNovo={() => location.reload()} />}
				{fase === 'sem-permissao' && <p className="aviso">sua conta entrou, mas não tem o papel "admin" no Keycloak.</p>}
				{fase === 'pronto' && (
					<>
						<Mensagens />
						<Destaques />
						<Numeros />
						<section className="bloco">
							<div className="cab-bloco">
								<h2>Vídeos</h2>
							</div>
							<p className="dica">
								Os vídeos vêm dos Reels do Instagram: título da primeira linha da legenda, categoria da hashtag (#resiliencia, #concorrencia, #consistencia,
								#seguranca, #arquitetura). O site se atualiza sozinho alguns minutos depois de postar.
							</p>
						</section>
					</>
				)}
			</main>
		</>
	);
}
