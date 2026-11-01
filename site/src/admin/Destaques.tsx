import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ArrowDown, ArrowUp, LoaderCircle, Plus, X } from 'lucide-react';
import { FalhaApi } from '../components/FalhaApi';
import { destaques as curados } from '../dados/projetos';
import { chaveDoProjeto, chaveDoRepositorio, MAXIMO_DESTAQUES, PADRAO } from '../lib/destaques';
import type { Repositorio } from '../lib/tipos';
import { chamar } from './api';
import { Botao } from '../components/Botao';
import { Card } from '../components/Card';

/** O que GET /admin-api/destaques devolve. */
interface NoPainel {
	selecao: string[] | null;
	repositorios: Repositorio[];
}

interface Opcao {
	chave: string;
	titulo: string;
	/** "projeto" (curado, com print) ou a linguagem do repositório. */
	detalhe: string;
	tipo: 'projeto' | 'github';
}

/** Escolhe e ordena os projetos de "Projetos em destaque" na home: curados (do código) e repositórios do GitHub. */
export function Destaques() {
	const [dados, setDados] = useState<NoPainel>();
	const [falhou, setFalhou] = useState(false);
	const [selecao, setSelecao] = useState<string[]>([]);
	const [salva, setSalva] = useState<string[] | null>(null);
	const [filtro, setFiltro] = useState('');
	const [salvando, setSalvando] = useState(false);
	const [aviso, setAviso] = useState<{ cor: string; texto: string }>();
	const trava = useRef(false);

	const carregar = useCallback(() => {
		setFalhou(false);
		setDados(undefined);
		chamar('/destaques')
			.then((r) => (r.ok ? r.json() : Promise.reject(r.status)))
			.then((d: NoPainel) => {
				setDados(d);
				setSalva(d.selecao);
				setSelecao(d.selecao ?? PADRAO);
			})
			.catch(() => setFalhou(true));
	}, []);
	useEffect(carregar, [carregar]);

	const opcoes = useMemo(() => {
		const mapa = new Map<string, Opcao>();
		for (const p of curados) mapa.set(chaveDoProjeto(p.slug), { chave: chaveDoProjeto(p.slug), titulo: p.titulo, detalhe: 'projeto com print', tipo: 'projeto' });
		for (const r of dados?.repositorios ?? []) mapa.set(chaveDoRepositorio(r.nome), { chave: chaveDoRepositorio(r.nome), titulo: r.nome, detalhe: r.linguagens[0] ?? 'GitHub', tipo: 'github' });
		return mapa;
	}, [dados]);

	const mudou = JSON.stringify(selecao) !== JSON.stringify(salva ?? PADRAO);
	const disponiveis = [...opcoes.values()].filter((o) => !selecao.includes(o.chave) && o.titulo.toLowerCase().includes(filtro.trim().toLowerCase()));
	const cheio = selecao.length >= MAXIMO_DESTAQUES;

	function mover(i: number, delta: number) {
		setSelecao((s) => {
			const nova = [...s];
			[nova[i], nova[i + delta]] = [nova[i + delta], nova[i]];
			return nova;
		});
		setAviso(undefined);
	}

	async function salvar(nova: string[] | null) {
		if (trava.current) return;
		trava.current = true;
		setSalvando(true);
		setAviso(undefined);
		try {
			const r = await chamar('/destaques', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ selecao: nova }) });
			if (r.status === 400) {
				const erro = ((await r.json().catch(() => ({}))) as { erros?: { selecao?: string } }).erros?.selecao;
				setAviso({ cor: 'vermelho', texto: erro ?? 'seleção inválida' });
				return;
			}
			if (!r.ok) throw new Error();
			setSalva(nova);
			setSelecao(nova ?? PADRAO);
			setAviso({ cor: 'verde', texto: 'salvo ✓ · a home já mostra assim' });
		} catch {
			setAviso({ cor: 'vermelho', texto: 'não deu pra salvar agora' });
		} finally {
			trava.current = false;
			setSalvando(false);
		}
	}

	return (
		<section className="bloco">
			<div className="cab-bloco">
				<h2>Destaques na <em>home</em></h2>
				<small className="dica">até {MAXIMO_DESTAQUES}, na ordem em que aparecem em "Projetos em destaque"</small>
			</div>
			{falhou && <FalhaApi oque="os projetos" tentarDeNovo={carregar} />}
			{!falhou && !dados && (
				<div className="destaques-painel" aria-busy="true">
					<span className="so-leitor" role="status">carregando os projetos</span>
					{Array.from({ length: 2 }, (_, i) => <Card key={i} className="esqueleto-mensagem" aria-hidden="true"><span className="esqueleto"></span><span className="esqueleto"></span><span className="esqueleto"></span></Card>)}
				</div>
			)}
			{dados && (
				<div className="destaques-painel">
					<Card className="coluna">
						<h3>Na home</h3>
						{selecao.length === 0
							? <p className="dica">Nenhum projeto selecionado: a home mostra "Nenhum projeto em destaque agora".</p>
							: (
								<ol className="escolhidos">
									{selecao.map((chave, i) => {
										const o = opcoes.get(chave);
										return (
											<li key={chave}>
												<span className="ordem">{i + 1}</span>
												<span className="nome"><strong>{o?.titulo ?? chave}</strong><small>{o ? o.detalhe : 'não existe mais: sai ao salvar'}</small></span>
												<button type="button" className="icone" aria-label={`subir ${o?.titulo ?? chave}`} disabled={i === 0} onClick={() => mover(i, -1)}><ArrowUp /></button>
												<button type="button" className="icone" aria-label={`descer ${o?.titulo ?? chave}`} disabled={i === selecao.length - 1} onClick={() => mover(i, 1)}><ArrowDown /></button>
												<button type="button" className="icone" aria-label={`tirar ${o?.titulo ?? chave} da home`} onClick={() => { setSelecao((s) => s.filter((c) => c !== chave)); setAviso(undefined); }}><X /></button>
											</li>
										);
									})}
								</ol>
							)}
						<div className="acoes-destaques">
							<Botao variante="primario" type="button" disabled={!mudou || salvando} onClick={() => salvar(selecao.filter((c) => opcoes.has(c)))}>
								{salvando ? <>salvando <LoaderCircle className="gira" aria-hidden="true" /></> : 'salvar'}
							</Botao>
							<Botao type="button" disabled={salvando || salva === null} onClick={() => salvar(null)}>voltar ao padrão</Botao>
							{aviso && <span className={`pill ${aviso.cor}`} role="status">{aviso.texto}</span>}
						</div>
					</Card>
					<Card className="coluna">
						<h3>Disponíveis</h3>
						<input className="filtro" type="search" placeholder="filtrar por nome" value={filtro} onChange={(e) => setFiltro(e.target.value)} aria-label="filtrar projetos disponíveis" />
						{dados.repositorios.length === 0 && <p className="dica">Os repositórios do GitHub ainda não foram lidos (a API lê a cada 10 min).</p>}
						{disponiveis.length === 0
							? <p className="dica">{filtro ? 'Nada com esse nome.' : 'Tudo já está na home.'}</p>
							: (
								<ul className="disponiveis">
									{disponiveis.map((o) => (
										<li key={o.chave}>
											<span className="nome"><strong>{o.titulo}</strong><small>{o.detalhe}</small></span>
											<Botao type="button" disabled={cheio} title={cheio ? `no máximo ${MAXIMO_DESTAQUES}` : undefined} onClick={() => { setSelecao((s) => [...s, o.chave]); setAviso(undefined); }}>
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
