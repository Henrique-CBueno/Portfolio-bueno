import { useRef, useState, type FormEvent } from 'react';
import { LoaderCircle } from 'lucide-react';
import { FalhaApi } from '../components/FalhaApi';
import { useNumeros } from '../hooks/useNumeros';
import { dataBR, formatarNumero } from '../lib/formato';
import type { Contagem } from '../lib/tipos';
import { Botao } from '../components/Botao';
import { Card } from '../components/Card';

const nomesRede: Record<string, string> = { instagram: 'Instagram', tiktok: 'TikTok', youtube: 'YouTube' };

/** Rede sem API ligada (Instagram sem META_API_KEY): número digitado aqui. */
function Manual({ contagem: c, salvar: salvarNaApi }: { contagem: Contagem; salvar: (rede: string, valor: number | null) => Promise<boolean> }) {
	const [valor, setValor] = useState(c.valor === null ? '' : String(c.valor));
	const [salvo, setSalvo] = useState<boolean>();
	const [salvando, setSalvando] = useState(false);
	const ocupado = useRef(false);

	async function salvar(e: FormEvent) {
		e.preventDefault();
		if (ocupado.current) return;
		ocupado.current = true;
		setSalvando(true);
		setSalvo(undefined);
		try {
			setSalvo(await salvarNaApi(c.rede, valor.trim() === '' ? null : Number(valor)));
		} finally {
			ocupado.current = false;
			setSalvando(false);
		}
	}

	return (
		<Card as="form" onSubmit={salvar}>
			<strong>{nomesRede[c.rede] ?? c.rede}</strong>
			<div className="linha-numero">
				<input type="number" min="0" inputMode="numeric" placeholder="seguidores" value={valor} onChange={(e) => setValor(e.target.value)} />
				<Botao type="submit" disabled={salvando}>
					{salvando ? (
						<>
							salvando <LoaderCircle className="gira" aria-hidden="true" />
						</>
					) : (
						'salvar'
					)}
				</Botao>
			</div>
			<small>
				{salvo === true ? (
					<span className="pill verde">salvo ✓</span>
				) : salvo === false ? (
					<span className="pill vermelho">não deu pra salvar</span>
				) : c.atualizadoEm ? (
					`atualizado em ${dataBR.format(new Date(c.atualizadoEm))}`
				) : (
					'sem número: o site mostra só o @'
				)}
			</small>
		</Card>
	);
}

/** Número lido pela API da rede (YouTube; Instagram com META_API_KEY). */
function lida(c: Contagem) {
	const unidade = c.rede === 'youtube' ? 'inscritos' : 'seguidores';
	if (c.valor === null) return c.rede === 'youtube' ? 'sem YOUTUBE_CHAVE: o site mostra só o @' : 'ainda não lido: o site mostra só o @';
	return `${c.aproximado ? '~' : ''}${formatarNumero(c.valor)} ${unidade} · lido pela API`;
}

export function Numeros() {
	const { contagens, falhou, carregar, salvar } = useNumeros();

	if (falhou)
		return (
			<section className="bloco">
				<FalhaApi oque="os números" tentarDeNovo={carregar} />
			</section>
		);

	return (
		<section className="bloco">
			<div className="cab-bloco">
				<h2>Números</h2>
				<small className="dica">Redes sem API ligada: digite aqui. Vazio = mostrar só o @.</small>
			</div>
			<div className="numeros">
				{contagens === undefined && (
					<>
						<span className="so-leitor" role="status">
							carregando os números
						</span>
						{Array.from({ length: 3 }, (_, i) => (
							<Card key={i} className="esqueleto-numero" aria-hidden="true">
								<span className="esqueleto"></span>
								<span className="esqueleto"></span>
							</Card>
						))}
					</>
				)}
				{contagens?.length === 0 && <p className="dica">Nenhuma rede pra mostrar agora.</p>}
				{contagens?.map((c) =>
					c.editavel ? (
						<Manual key={c.rede} contagem={c} salvar={salvar} />
					) : (
						<Card key={c.rede}>
							<strong>{nomesRede[c.rede] ?? c.rede}</strong>
							<small>{lida(c)}</small>
						</Card>
					),
				)}
			</div>
		</section>
	);
}
