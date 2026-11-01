import { useCallback, useEffect, useState, type FormEvent } from 'react';
import { FalhaApi } from '../components/FalhaApi';
import { chamar, dataBR } from './api';
import { formatarNumero } from '../lib/formato';
import type { Contagem } from '../lib/tipos';

/** O que o painel recebe: a contagem e se ela é digitada aqui ou lida da rede. */
type NoPainel = Contagem & { editavel: boolean };

const nomesRede: Record<string, string> = { instagram: 'Instagram', tiktok: 'TikTok', youtube: 'YouTube' };

/** Rede sem API ligada (Instagram sem META_API_KEY): número digitado aqui. */
function Manual({ contagem: c }: { contagem: Contagem }) {
	const [valor, setValor] = useState(c.valor === null ? '' : String(c.valor));
	const [salvo, setSalvo] = useState<boolean>();

	async function salvar(e: FormEvent) {
		e.preventDefault();
		const numero = valor.trim() === '' ? null : Number(valor);
		const resposta = await chamar(`/contagens/${c.rede}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ valor: numero }) });
		setSalvo(resposta.ok);
	}

	return (
		<form className="painel" onSubmit={salvar}>
			<strong>{nomesRede[c.rede] ?? c.rede}</strong>
			<div className="linha-numero">
				<input type="number" min="0" inputMode="numeric" placeholder="seguidores" value={valor} onChange={(e) => setValor(e.target.value)} />
				<button className="botao" type="submit">salvar</button>
			</div>
			<small>
				{salvo === true ? <span className="pill verde">salvo ✓</span>
					: salvo === false ? <span className="pill vermelho">não deu pra salvar</span>
					: c.atualizadoEm ? `atualizado em ${dataBR.format(new Date(c.atualizadoEm))}` : 'sem número: o site mostra só o @'}
			</small>
		</form>
	);
}

/** Número lido pela API da rede (YouTube; Instagram com META_API_KEY). */
function lida(c: Contagem) {
	const unidade = c.rede === 'youtube' ? 'inscritos' : 'seguidores';
	if (c.valor === null) return c.rede === 'youtube' ? 'sem YOUTUBE_CHAVE: o site mostra só o @' : 'ainda não lido: o site mostra só o @';
	return `${c.aproximado ? '~' : ''}${formatarNumero(c.valor)} ${unidade} · lido pela API`;
}

export function Numeros() {
	const [contagens, setContagens] = useState<NoPainel[]>();
	const [falhou, setFalhou] = useState(false);

	const carregar = useCallback(() => {
		setFalhou(false);
		chamar('/contagens')
			.then((r) => (r.ok ? r.json() : Promise.reject(r.status)))
			.then(setContagens)
			.catch(() => setFalhou(true));
	}, []);
	useEffect(carregar, [carregar]);

	if (falhou) return <section className="bloco"><FalhaApi oque="os números" tentarDeNovo={carregar} /></section>;

	return (
		<section className="bloco">
			<div className="cab-bloco"><h2>Números</h2><small className="dica">Redes sem API ligada: digite aqui. Vazio = mostrar só o @.</small></div>
			<div className="numeros">
				{contagens === undefined && <p className="dica">carregando…</p>}
				{contagens?.map((c) => c.editavel
					? <Manual key={c.rede} contagem={c} />
					: (
						<div key={c.rede} className="painel">
							<strong>{nomesRede[c.rede] ?? c.rede}</strong>
							<small>{lida(c)}</small>
						</div>
					))}
			</div>
		</section>
	);
}
