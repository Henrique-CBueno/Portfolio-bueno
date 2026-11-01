import { useEffect, useRef, useState, type ChangeEvent, type FormEvent, type InputHTMLAttributes, type TextareaHTMLAttributes } from 'react';
import { animate } from 'motion';
import { Copy, Check, LoaderCircle, Send } from 'lucide-react';
import { Marca } from './Marca';
import { Titulo } from './Titulo';
import { perfil, redes } from '../dados/perfil';
import { movimentoReduzido } from '../lib/movimento-reduzido';
import { CAMPOS, MAXIMO, MINIMO_MENSAGEM, VAZIO, validar, validarCampo, type Campo, type Erros, type Valores } from '../lib/contato';
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
		try { await navigator.clipboard.writeText(perfil.email); } catch { /* sem permissão: o e-mail continua visível */ }
		setCopiado(true);
		if (!movimentoReduzido() && selo.current) animate(selo.current, { scale: [0.8, 1] }, { type: 'spring', bounce: 0.5, duration: 0.4 });
		clearTimeout(volta.current);
		volta.current = window.setTimeout(() => setCopiado(false), 2200);
	}

	return (
		<button className="email" type="button" onClick={copiar} data-revela="">
			<span className="sublinha">{perfil.email}</span>
			<span className={`pill ${copiado ? 'verde' : 'neutro'} selo`} ref={selo}>
				<span>{copiado ? <Check /> : <Copy />}</span><span>{copiado ? 'copiado' : 'copiar'}</span>
			</span>
		</button>
	);
}

type Estado = { cor: Cor; texto: string; vez: number };

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
			<label htmlFor={campo}>{rotulo}{opcional && <span className="opcional"> · opcional</span>}</label>
			{campo === 'mensagem' ? <textarea ref={refCampo} {...comum} /> : <input ref={refCampo} {...comum} />}
			{erro ? <small id={idAviso} className="aviso erro">{erro}</small> : dica ? <small id={idAviso} className="aviso">{dica}</small> : null}
		</div>
	);
}

/**
 * Formulário → POST /contato na API, que guarda a mensagem (painel /admin) e manda por e-mail.
 * Cada campo é conferido ao sair dele e ao enviar, com a mesma regra da API (lib/contato.ts); o que a API
 * recusar volta pro campo certo.
 */
function Formulario() {
	const [valores, setValores] = useState<Valores>(VAZIO);
	const [erros, setErros] = useState<Erros>({});
	// só mostra erro de campo que a pessoa já deixou (ou depois de tentar enviar), não enquanto digita pela primeira vez
	const [vistos, setVistos] = useState<Set<Campo>>(new Set());
	const [armadilha, setArmadilha] = useState('');
	const [estado, setEstado] = useState<Estado>();
	const [enviando, setEnviando] = useState(false);
	// trava síncrona: o estado do React só atualiza no próximo desenho, e um clique duplo cairia nesse intervalo
	const ocupado = useRef(false);
	const pill = useRef<HTMLSpanElement>(null);
	const campos = useRef(new Map<Campo, HTMLInputElement | HTMLTextAreaElement>());
	const avisar = (cor: Cor, texto: string) => setEstado((e) => ({ cor, texto, vez: (e?.vez ?? 0) + 1 }));

	useEffect(() => {
		if (estado && pill.current && !movimentoReduzido()) animate(pill.current, { opacity: [0, 1], y: [6, 0] }, { duration: 0.3 });
	}, [estado]);

	function aoMudar(campo: Campo, valor: string) {
		setValores((v) => ({ ...v, [campo]: valor }));
		// erro some (ou muda) enquanto a pessoa corrige
		if (vistos.has(campo)) setErros((e) => ({ ...e, [campo]: validarCampo(campo, valor) }));
	}

	function aoSair(campo: Campo) {
		// sair de um campo obrigatório vazio sem nunca ter digitado não é erro ainda
		if (!valores[campo] && !vistos.has(campo)) return;
		setVistos((v) => new Set(v).add(campo));
		setErros((e) => ({ ...e, [campo]: validarCampo(campo, valores[campo]) }));
	}

	function focarPrimeiroErro(lista: Erros) {
		const primeiro = CAMPOS.find((c) => lista[c]);
		if (primeiro) campos.current.get(primeiro)?.focus();
	}

	async function enviar(evento: FormEvent<HTMLFormElement>) {
		evento.preventDefault();
		if (ocupado.current) return;

		const encontrados = validar(valores);
		setVistos(new Set(CAMPOS));
		setErros(encontrados);
		if (Object.keys(encontrados).length > 0) {
			avisar('vermelho', 'confira os campos destacados');
			focarPrimeiroErro(encontrados);
			return;
		}
		// armadilha preenchida = robô: finge que deu certo
		if (armadilha) { avisar('verde', 'mensagem enviada ✓'); limpar(); return; }

		const api = import.meta.env.PUBLIC_API_URL;
		ocupado.current = true;
		setEnviando(true);
		avisar('amarelo', 'enviando…');
		try {
			if (!api) throw new Error('sem API');
			const resposta = await fetch(new URL('/contato', api), {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ nome: valores.nome.trim(), email: valores.email.trim(), assunto: valores.assunto.trim(), mensagem: valores.mensagem.trim() }),
			});
			if (resposta.status === 429) { avisar('amarelo', 'muitas mensagens seguidas · tente daqui a pouco'); return; }
			if (resposta.status === 400) {
				// a API conferiu de novo e achou algo: volta pro campo certo
				const daApi = ((await resposta.json().catch(() => ({}))) as { erros?: Erros }).erros ?? {};
				setErros(daApi);
				avisar('vermelho', 'confira os campos destacados');
				focarPrimeiroErro(daApi);
				return;
			}
			if (!resposta.ok) throw new Error(String(resposta.status));
			avisar('verde', 'mensagem enviada ✓ · respondo no e-mail que você deixou');
			limpar();
		} catch {
			avisar('vermelho', 'não foi agora · tente de novo ou use o e-mail ao lado');
		} finally {
			ocupado.current = false;
			setEnviando(false);
		}
	}

	function limpar() {
		setValores(VAZIO);
		setErros({});
		setVistos(new Set());
		setArmadilha('');
	}

	const tamanho = valores.mensagem.trim().length;
	const faltam = MINIMO_MENSAGEM - tamanho;
	const props = (campo: Campo) => ({
		campo,
		valor: valores[campo],
		erro: erros[campo],
		aoMudar,
		aoSair,
		refCampo: (el: HTMLInputElement | HTMLTextAreaElement | null) => { if (el) campos.current.set(campo, el); else campos.current.delete(campo); },
	});

	return (
		<Card as="form" className="formulario acompanha" noValidate onSubmit={enviar} aria-busy={enviando} data-revela="">
			<div className="linha">
				<CampoDoFormulario {...props('nome')} rotulo="nome" extra={{ autoComplete: 'name', placeholder: 'Como posso te chamar?' }} />
				<CampoDoFormulario {...props('email')} rotulo="e-mail" extra={{ type: 'email', autoComplete: 'email', inputMode: 'email', placeholder: 'voce@empresa.com' }} />
			</div>
			<CampoDoFormulario {...props('assunto')} rotulo="assunto" opcional extra={{ placeholder: 'Parceria, vaga, projeto, dúvida…' }} />
			<CampoDoFormulario
				{...props('mensagem')}
				rotulo="mensagem"
				dica={tamanho > 0 && faltam > 0 ? `faltam ${faltam} ${faltam === 1 ? 'caractere' : 'caracteres'} (mínimo ${MINIMO_MENSAGEM})` : undefined}
				extra={{ placeholder: 'Conta um pouco do que você precisa.' }}
			/>
			<div className="armadilha" aria-hidden="true"><label htmlFor="site">site</label><input id="site" name="site" tabIndex={-1} autoComplete="off" value={armadilha} onChange={(e) => setArmadilha(e.target.value)} /></div>
			<div className="enviar">
				<small aria-live="polite">{estado ? <span key={estado.vez} ref={pill} className={`pill ${estado.cor}`}>{estado.texto}</span> : 'vai direto pro meu e-mail'}</small>
				<Botao variante="primario" type="submit" disabled={enviando}>
					{enviando ? <>enviando… <LoaderCircle className="gira" aria-hidden="true" /></> : <>enviar mensagem <Send /></>}
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
					<p className="ou" data-revela="">Ou escreva direto:</p>
					<Email />
					<div className="redes" data-grupo="">
						{(Object.keys(redes) as Rede[]).map((r) => <a key={r} className={`pill ${cores[r]}`} href={redes[r].url} target="_blank" rel="me noopener noreferrer"><Marca rede={r} />{r}</a>)}
					</div>
				</div>
				<Formulario />
			</div>
		</section>
	);
}
