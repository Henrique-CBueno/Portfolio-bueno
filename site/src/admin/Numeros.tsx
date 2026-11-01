import { useEffect, useState, type FormEvent } from 'react';
import { chamar, dataBR } from './api';
import { formatarNumero } from '../lib/formato';
import type { Contagem } from '../lib/tipos';

const nomesRede: Record<string, string> = { instagram: 'Instagram', tiktok: 'TikTok', youtube: 'YouTube' };

/** Instagram e TikTok: número digitado aqui. */
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

export function Numeros() {
	const [contagens, setContagens] = useState<Contagem[]>([]);

	useEffect(() => {
		chamar('/contagens').then((r) => r.json()).then(setContagens);
	}, []);

	return (
		<section className="bloco">
			<div className="cab-bloco"><h2>Números</h2><small className="dica">Instagram e TikTok não têm API ligada: digite aqui. Vazio = mostrar só o @.</small></div>
			<div className="numeros">
				{contagens.map((c) => c.rede === 'youtube'
					? (
						<div key={c.rede} className="painel">
							<strong>YouTube</strong>
							<small>{c.valor === null ? 'sem YOUTUBE_CHAVE: o site mostra só o @' : `${c.aproximado ? '~' : ''}${formatarNumero(c.valor)} inscritos · lido pela API`}</small>
						</div>
					)
					: <Manual key={c.rede} contagem={c} />)}
			</div>
		</section>
	);
}
