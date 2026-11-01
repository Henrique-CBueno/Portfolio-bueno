import { useState } from 'react';
import { ArrowDown, ArrowUp, LoaderCircle, Plus, X } from 'lucide-react';
import { FalhaApi } from '../components/FalhaApi';
import { MAXIMO_DESTAQUES } from '../lib/destaques';
import { useDestaques } from '../hooks/useDestaques';
import { Botao } from '../components/Botao';
import { Card } from '../components/Card';

/** Escolhe e ordena os projetos de "Projetos em destaque" na home: curados (do código) e repositórios do GitHub. */
export function Destaques() {
	const {
		dados,
		falhou,
		carregar,
		opcoes,
		selecao,
		disponiveis: filtrar,
		mover,
		adicionar,
		remover,
		salvarSelecao,
		voltarAoPadrao,
		mudou,
		ehPadrao,
		cheio,
		salvando,
		aviso,
	} = useDestaques();
	const [filtro, setFiltro] = useState('');
	const disponiveis = filtrar(filtro);

	return (
		<section className="bloco">
			<div className="cab-bloco">
				<h2>
					Destaques na <em>home</em>
				</h2>
				<small className="dica">até {MAXIMO_DESTAQUES}, na ordem em que aparecem em "Projetos em destaque"</small>
			</div>
			{falhou && <FalhaApi oque="os projetos" tentarDeNovo={carregar} />}
			{!falhou && !dados && (
				<div className="destaques-painel" aria-busy="true">
					<span className="so-leitor" role="status">
						carregando os projetos
					</span>
					{Array.from({ length: 2 }, (_, i) => (
						<Card key={i} className="esqueleto-mensagem" aria-hidden="true">
							<span className="esqueleto"></span>
							<span className="esqueleto"></span>
							<span className="esqueleto"></span>
						</Card>
					))}
				</div>
			)}
			{dados && (
				<div className="destaques-painel">
					<Card className="coluna">
						<h3>Na home</h3>
						{selecao.length === 0 ? (
							<p className="dica">Nenhum projeto selecionado: a home mostra "Nenhum projeto em destaque agora".</p>
						) : (
							<ol className="escolhidos">
								{selecao.map((chave, i) => {
									const o = opcoes.get(chave);
									return (
										<li key={chave}>
											<span className="ordem">{i + 1}</span>
											<span className="nome">
												<strong>{o?.titulo ?? chave}</strong>
												<small>{o ? o.detalhe : 'não existe mais: sai ao salvar'}</small>
											</span>
											<button type="button" className="icone" aria-label={`subir ${o?.titulo ?? chave}`} disabled={i === 0} onClick={() => mover(i, -1)}>
												<ArrowUp />
											</button>
											<button
												type="button"
												className="icone"
												aria-label={`descer ${o?.titulo ?? chave}`}
												disabled={i === selecao.length - 1}
												onClick={() => mover(i, 1)}
											>
												<ArrowDown />
											</button>
											<button type="button" className="icone" aria-label={`tirar ${o?.titulo ?? chave} da home`} onClick={() => remover(chave)}>
												<X />
											</button>
										</li>
									);
								})}
							</ol>
						)}
						<div className="acoes-destaques">
							<Botao variante="primario" type="button" disabled={!mudou || salvando} onClick={salvarSelecao}>
								{salvando ? (
									<>
										salvando <LoaderCircle className="gira" aria-hidden="true" />
									</>
								) : (
									'salvar'
								)}
							</Botao>
							<Botao type="button" disabled={salvando || ehPadrao} onClick={voltarAoPadrao}>
								voltar ao padrão
							</Botao>
							{aviso && (
								<span className={`pill ${aviso.cor}`} role="status">
									{aviso.texto}
								</span>
							)}
						</div>
					</Card>
					<Card className="coluna">
						<h3>Disponíveis</h3>
						<input
							className="filtro"
							type="search"
							placeholder="filtrar por nome"
							value={filtro}
							onChange={(e) => setFiltro(e.target.value)}
							aria-label="filtrar projetos disponíveis"
						/>
						{dados.repositorios.length === 0 && <p className="dica">Os repositórios do GitHub ainda não foram lidos (a API lê a cada 10 min).</p>}
						{disponiveis.length === 0 ? (
							<p className="dica">{filtro ? 'Nada com esse nome.' : 'Tudo já está na home.'}</p>
						) : (
							<ul className="disponiveis">
								{disponiveis.map((o) => (
									<li key={o.chave}>
										<span className="nome">
											<strong>{o.titulo}</strong>
											<small>{o.detalhe}</small>
										</span>
										<Botao type="button" disabled={cheio} title={cheio ? `no máximo ${MAXIMO_DESTAQUES}` : undefined} onClick={() => adicionar(o.chave)}>
											<Plus /> adicionar
										</Botao>
									</li>
								))}
							</ul>
						)}
					</Card>
				</div>
			)}
		</section>
	);
}
