import { useMemo, useRef, useState } from 'react';
import { buscarDestaques, Recusado, salvarDestaques } from '../services/painel';
import { useCarregamento } from './useCarregamento';
import { destaques as curados } from '../dados/projetos';
import { chaveDoProjeto, chaveDoRepositorio, MAXIMO_DESTAQUES, PADRAO } from '../lib/destaques';
import type { Cor } from '../lib/tipos';

/** Um projeto que pode ir pra home: curado (do código) ou repositório do GitHub. */
export interface OpcaoDeDestaque {
	chave: string;
	titulo: string;
	/** "projeto com print" (curado) ou a linguagem do repositório. */
	detalhe: string;
	tipo: 'projeto' | 'github';
}

/**
 * Escolha dos destaques da home no painel: carrega a seleção e os candidatos, edita a ordem em memória
 * (mover, adicionar, remover) e salva na API. `null` salvo = padrão (os curados).
 */
export function useDestaques() {
	const { dados, falhou, recarregar } = useCarregamento(buscarDestaques);
	/** O que foi salvo nesta visita (sobrepõe o que veio da API). */
	const [salvaAgora, setSalvaAgora] = useState<{ selecao: string[] | null }>();
	/** Edição em curso, ainda não salva (undefined = sem edição: mostra a salva). */
	const [edicao, setEdicao] = useState<string[]>();
	const [salvando, setSalvando] = useState(false);
	const [aviso, setAviso] = useState<{ cor: Cor; texto: string }>();
	const trava = useRef(false);

	const salva = salvaAgora ? salvaAgora.selecao : (dados?.selecao ?? null);
	const selecao = edicao ?? salva ?? PADRAO;

	const carregar = () => {
		setSalvaAgora(undefined);
		setEdicao(undefined);
		setAviso(undefined);
		recarregar();
	};

	const opcoes = useMemo(() => {
		const mapa = new Map<string, OpcaoDeDestaque>();
		for (const p of curados)
			mapa.set(chaveDoProjeto(p.slug), { chave: chaveDoProjeto(p.slug), titulo: p.titulo, detalhe: 'projeto com print', tipo: 'projeto' });
		for (const r of dados?.repositorios ?? [])
			mapa.set(chaveDoRepositorio(r.nome), { chave: chaveDoRepositorio(r.nome), titulo: r.nome, detalhe: r.linguagens[0] ?? 'GitHub', tipo: 'github' });
		return mapa;
	}, [dados]);

	/** Os que ainda não estão na home, filtrados pelo nome. */
	const disponiveis = (filtro: string) =>
		[...opcoes.values()].filter((o) => !selecao.includes(o.chave) && o.titulo.toLowerCase().includes(filtro.trim().toLowerCase()));

	const editar = (mudanca: (s: string[]) => string[]) => {
		setEdicao(mudanca(selecao));
		setAviso(undefined);
	};
	const mover = (i: number, delta: number) =>
		editar((s) => {
			const nova = [...s];
			[nova[i], nova[i + delta]] = [nova[i + delta], nova[i]];
			return nova;
		});
	const adicionar = (chave: string) => editar((s) => [...s, chave]);
	const remover = (chave: string) => editar((s) => s.filter((c) => c !== chave));

	async function salvar(nova: string[] | null) {
		if (trava.current) return;
		trava.current = true;
		setSalvando(true);
		setAviso(undefined);
		try {
			await salvarDestaques(nova);
			setSalvaAgora({ selecao: nova });
			setEdicao(undefined);
			setAviso({ cor: 'verde', texto: 'salvo ✓ · a home já mostra assim' });
		} catch (erro) {
			setAviso({ cor: 'vermelho', texto: erro instanceof Recusado ? erro.mensagem : 'não deu pra salvar agora' });
		} finally {
			trava.current = false;
			setSalvando(false);
		}
	}

	return {
		dados,
		falhou,
		carregar,
		opcoes,
		selecao,
		disponiveis,
		mover,
		adicionar,
		remover,
		/** Salva a seleção como está (sem chaves que não existem mais). */
		salvarSelecao: () => salvar(selecao.filter((c) => opcoes.has(c))),
		voltarAoPadrao: () => salvar(null),
		mudou: JSON.stringify(selecao) !== JSON.stringify(salva ?? PADRAO),
		ehPadrao: salva === null,
		cheio: selecao.length >= MAXIMO_DESTAQUES,
		salvando,
		aviso,
	};
}
