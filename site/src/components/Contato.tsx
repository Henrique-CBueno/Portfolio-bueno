import { useEffect, useRef, useState, type ChangeEvent, type InputHTMLAttributes, type TextareaHTMLAttributes } from 'react';
import { animate } from 'motion';
import { Copy, Check, LoaderCircle, Send } from 'lucide-react';
import { Marca } from './Marca';
import { Titulo } from './Titulo';
import { perfil, redes } from '../dados/perfil';
import { movimentoReduzido } from '../lib/movimento-reduzido';
import { MAXIMO, type Campo } from '../lib/contato';
import { useFormularioContato } from '../hooks/useFormularioContato';
import type { Cor, Rede } from '../lib/tipos';
import './Contato.css';
import { Botao } from './Botao';
import { Card } from './Card';

const cores: Record<Rede, Cor> = { instagram: 'roxo', tiktok: 'azul', youtube: 'vermelho', github: 'verde', linkedin: 'amarelo' };

/** E-mail copiável: o selo vira "copiado" por um tempo. */
function Email() {
	const [copiado, setCopiado] = useState(false);
	const selo = useRef<HTMLSpanElement>(null);
	const volta = useRef<number>(undefined);
	useEffect(() => () => clearTimeout(volta.current), []);

	async function copiar() {
		try {
			await navigator.clipboard.writeText(perfil.email);
		} catch {
			/* sem permissão: o e-mail continua visível */
		}
		setCopiado(true);
		if (!movimentoReduzido() && selo.current) animate(selo.current, { scale: [0.8, 1] }, { type: 'spring', bounce: 0.5, duration: 0.4 });
		clearTimeout(volta.current);
		volta.current = window.setTimeout(() => setCopiado(false), 2200);
	}

	return (
		<button className="email" type="button" onClick={copiar} data-revela="">
			<span className="sublinha">{perfil.email}</span>
			<span className={`pill ${copiado ? 'verde' : 'neutro'} selo`} ref={selo}>
				<span>{copiado ? <Check /> : <Copy />}</span>
				<span>{copiado ? 'copiado' : 'copiar'}</span>
			</span>
		</button>
	);
}

interface PropsCampo {
	campo: Campo;
	rotulo: string;
	valor: string;
	erro?: string;
	/** Texto de ajuda quando não há erro (ex.: quantos caracteres faltam). */
	dica?: string;
	opcional?: boolean;
	aoMudar: (campo: Campo, valor: string) => void;
	aoSair: (campo: Campo) => void;
	refCampo: (el: HTMLInputElement | HTMLTextAreaElement | null) => void;
	extra: InputHTMLAttributes<HTMLInputElement> & TextareaHTMLAttributes<HTMLTextAreaElement>;
}

/** Um campo com a mensagem dele embaixo, ligada por aria-describedby (o leitor de tela lê junto). */
function CampoDoFormulario({ campo, rotulo, valor, erro, dica, opcional, aoMudar, aoSair, refCampo, extra }: PropsCampo) {
	const idAviso = `aviso-${campo}`;
	const comum = {
		id: campo,
		name: campo,
		value: valor,
		maxLength: MAXIMO[campo],
		'aria-invalid': erro ? true : undefined,
		'aria-required': opcional ? undefined : true,
		'aria-describedby': erro || dica ? idAviso : undefined,
		onChange: (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => aoMudar(campo, e.target.value),
		onBlur: () => aoSair(campo),
		...extra,
	};
	return (
		<div className="campo">
			<label htmlFor={campo}>
				{rotulo}
				{opcional && <span className="opcional"> · opcional</span>}
			</label>
			{campo === 'mensagem' ? <textarea ref={refCampo} {...comum} /> : <input ref={refCampo} {...comum} />}
			{erro ? (
				<small id={idAviso} className="aviso erro">
					{erro}
				</small>
			) : dica ? (
				<small id={idAviso} className="aviso">
					{dica}
				</small>
			) : null}
		</div>
	);
}

/** Formulário de contato: só a aparência. Validação, envio e avisos ficam em useFormularioContato. */
function Formulario() {
	const { campo, dicaDaMensagem, armadilha, setArmadilha, aviso, enviando, enviar } = useFormularioContato();
	const pill = useRef<HTMLSpanElement>(null);

	useEffect(() => {
		if (aviso && pill.current && !movimentoReduzido()) animate(pill.current, { opacity: [0, 1], y: [6, 0] }, { duration: 0.3 });
	}, [aviso]);

	return (
		<Card as="form" className="formulario acompanha" noValidate onSubmit={enviar} aria-busy={enviando} data-revela="">
			<div className="linha">
				<CampoDoFormulario {...campo('nome')} rotulo="nome" extra={{ autoComplete: 'name', placeholder: 'Como posso te chamar?' }} />
				<CampoDoFormulario
					{...campo('email')}
					rotulo="e-mail"
					extra={{ type: 'email', autoComplete: 'email', inputMode: 'email', placeholder: 'voce@empresa.com' }}
				/>
			</div>
			<CampoDoFormulario {...campo('assunto')} rotulo="assunto" opcional extra={{ placeholder: 'Parceria, vaga, projeto, dúvida…' }} />
			<CampoDoFormulario {...campo('mensagem')} rotulo="mensagem" dica={dicaDaMensagem} extra={{ placeholder: 'Conta um pouco do que você precisa.' }} />
			<div className="armadilha" aria-hidden="true">
				<label htmlFor="site">site</label>
				<input id="site" name="site" tabIndex={-1} autoComplete="off" value={armadilha} onChange={(e) => setArmadilha(e.target.value)} />
			</div>
			<div className="enviar">
				<small aria-live="polite">
					{aviso ? (
						<span key={aviso.vez} ref={pill} className={`pill ${aviso.cor}`}>
							{aviso.texto}
						</span>
					) : (
						'vai direto pro meu e-mail'
					)}
				</small>
				<Botao variante="primario" type="submit" disabled={enviando}>
					{enviando ? (
						<>
							enviando… <LoaderCircle className="gira" aria-hidden="true" />
						</>
					) : (
						<>
							enviar mensagem <Send />
						</>
					)}
				</Botao>
			</div>
		</Card>
	);
}

export function Contato() {
	return (
		<section className="secao contato" id="contato">
			<div className="grade">
				<div className="texto acompanha">
					<Titulo antes="Contato" />
					<p data-revela="">Parcerias, convites, projetos ou só pra conversar sobre backend. Respondo pelo e-mail que você deixar.</p>
					<p className="ou" data-revela="">
						Ou escreva direto:
					</p>
					<Email />
					<div className="redes" data-grupo="">
						{(Object.keys(redes) as Rede[]).map((r) => (
							<a key={r} className={`pill ${cores[r]}`} href={redes[r].url} target="_blank" rel="me noopener noreferrer">
								<Marca rede={r} />
								{r}
							</a>
						))}
					</div>
				</div>
				<Formulario />
			</div>
		</section>
	);
}
