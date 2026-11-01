import { useEffect, useRef, useState, type FormEvent } from 'react';
import { api, chamar, diaSP } from './api';
import { categoria as infoCategoria } from '../lib/categorias';
import type { Cor, Video } from '../lib/tipos';

const DICA = 'o card leva pro instagram; sem ele, pro tiktok; sem os dois, pro youtube';

interface Props {
	categorias: string[];
	editando: Video | null;
	aoSalvar: () => Promise<void>;
	aoCancelar: () => void;
}

export function FormVideo({ categorias, editando, aoSalvar, aoCancelar }: Props) {
	const raiz = useRef<HTMLElement>(null);
	const [erros, setErros] = useState<Record<string, string>>({});
	const [estado, setEstado] = useState<{ cor: Cor; texto: string }>();
	const [enviando, setEnviando] = useState(false);
	const capaAtual = editando ? `${api}${editando.capa}` : null;
	const [previa, setPrevia] = useState<string | null>(capaAtual);

	// trocar o vídeo em edição recomeça o formulário (o <form> tem key e remonta)
	useEffect(() => {
		setErros({});
		setPrevia(capaAtual);
		if (editando) {
			setEstado(undefined);
			raiz.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
		}
	}, [editando, capaAtual]);

	async function enviar(evento: FormEvent<HTMLFormElement>) {
		evento.preventDefault();
		const form = evento.currentTarget;
		setErros({});
		setEnviando(true);
		setEstado({ cor: 'amarelo', texto: 'salvando…' });
		try {
			const dados = new FormData(form);
			if (!(dados.get('capa') as File | null)?.size) dados.delete('capa');
			const resposta = editando
				? await chamar(`/videos/${editando.id}`, { method: 'PUT', body: dados })
				: await chamar('/videos', { method: 'POST', body: dados });
			if (resposta.status === 400) {
				setErros((await resposta.json()).erros ?? {});
				setEstado({ cor: 'vermelho', texto: 'confira os campos' });
				return;
			}
			if (!resposta.ok) throw new Error(String(resposta.status));
			setEstado({ cor: 'verde', texto: editando ? 'alterações salvas ✓' : 'vídeo publicado ✓' });
			form.reset();
			setPrevia(null);
			await aoSalvar();
		} catch {
			setEstado({ cor: 'vermelho', texto: 'não deu pra salvar agora' });
		} finally {
			setEnviando(false);
		}
	}

	const erro = (campo: string) => (erros[campo] ? 'erro' : undefined);
	const mensagem = (campo: string, className?: string) => <small className={className}>{erros[campo] ?? ''}</small>;

	return (
		<section className="bloco" ref={raiz}>
			<div className="cab-bloco">
				<h2>{editando ? 'Editar' : 'Novo'} <em>vídeo</em></h2>
				{editando && <button className="botao" type="button" onClick={() => { setEstado(undefined); aoCancelar(); }}>cancelar edição</button>}
			</div>
			<form key={editando?.id ?? 'novo'} className="painel form-video" noValidate onSubmit={enviar}>
				<label className="capa-campo">
					<input
						type="file"
						name="capa"
						accept="image/jpeg,image/png,image/webp"
						onChange={(e) => { const arquivo = e.currentTarget.files?.[0]; setPrevia(arquivo ? URL.createObjectURL(arquivo) : capaAtual); }}
					/>
					{previa ? <img alt="" src={previa} /> : <span>capa 9:16<br /><small>JPEG, PNG ou WebP · até 5 MB</small></span>}
				</label>
				<div className="campos">
					<div className="campo"><label htmlFor="titulo">título</label><input id="titulo" name="titulo" maxLength={120} required placeholder="1 API lenta derrubou tudo" defaultValue={editando?.titulo ?? ''} className={erro('titulo')} />{mensagem('titulo')}</div>
					<div className="linha">
						<div className="campo">
							<label htmlFor="categoria">categoria</label>
							<select id="categoria" name="categoria" defaultValue={editando?.categoria ?? ''} className={erro('categoria')}>
								<option value="">sem categoria</option>
								{categorias.map((c) => <option key={c} value={c}>{infoCategoria(c)?.nome ?? c}</option>)}
							</select>
							{mensagem('categoria')}
						</div>
						<div className="campo"><label htmlFor="publicadoEm">publicado em</label><input id="publicadoEm" name="publicadoEm" type="date" required defaultValue={editando ? diaSP(new Date(editando.publicadoEm)) : diaSP()} className={erro('publicadoEm')} />{mensagem('publicadoEm')}</div>
					</div>
					<div className="campo"><label htmlFor="instagram">link no instagram</label><input id="instagram" name="instagram" type="url" placeholder="https://www.instagram.com/reel/…" defaultValue={editando?.links?.instagram ?? ''} className={erro('instagram')} />{mensagem('instagram')}</div>
					<div className="campo"><label htmlFor="tiktok">link no tiktok</label><input id="tiktok" name="tiktok" type="url" placeholder="https://www.tiktok.com/@bueno_dev0/video/…" defaultValue={editando?.links?.tiktok ?? ''} className={erro('tiktok')} />{mensagem('tiktok')}</div>
					<div className="campo"><label htmlFor="youtube">link no youtube</label><input id="youtube" name="youtube" type="url" placeholder="https://youtube.com/shorts/…" defaultValue={editando?.links?.youtube ?? ''} className={erro('youtube')} />{mensagem('youtube')}</div>
					{mensagem('links', 'erro-geral')}
					{mensagem('capa', 'erro-geral')}
					<div className="enviar">
						<small>{estado ? <span className={`pill ${estado.cor}`}>{estado.texto}</span> : editando ? 'deixe a capa como está ou escolha outra' : DICA}</small>
						<button className="botao primario" type="submit" disabled={enviando}>{editando ? 'salvar alterações' : 'publicar'}</button>
					</div>
				</div>
			</form>
		</section>
	);
}
