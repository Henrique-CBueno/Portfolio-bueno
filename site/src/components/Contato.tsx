import { useEffect, useRef, useState, type FormEvent } from 'react';
import { animate } from 'motion';
import { Copy, Check, Send } from 'lucide-react';
import { Marca } from './Marca';
import { Titulo } from './Titulo';
import { perfil, redes } from '../dados/perfil';
import { movimentoReduzido } from '../lib/movimento-reduzido';
import type { Cor, Rede } from '../lib/tipos';
import './Contato.css';

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

/** Formulário → POST /contato na API. */
function Formulario() {
	const [estado, setEstado] = useState<Estado>();
	const [enviando, setEnviando] = useState(false);
	const pill = useRef<HTMLSpanElement>(null);
	const avisar = (cor: Cor, texto: string) => setEstado((e) => ({ cor, texto, vez: (e?.vez ?? 0) + 1 }));

	useEffect(() => {
		if (estado && pill.current && !movimentoReduzido()) animate(pill.current, { opacity: [0, 1], y: [6, 0] }, { duration: 0.3 });
	}, [estado]);

	async function enviar(evento: FormEvent<HTMLFormElement>) {
		evento.preventDefault();
		const form = evento.currentTarget;
		if (!form.checkValidity()) { form.reportValidity(); return; }
		const dados = Object.fromEntries(new FormData(form)) as Record<string, string>;
		// armadilha preenchida = robô: finge que deu certo
		if (dados.site) { avisar('verde', 'mensagem enviada ✓'); form.reset(); return; }

		const api = import.meta.env.PUBLIC_API_URL;
		setEnviando(true);
		avisar('amarelo', 'enviando…');
		try {
			if (!api) throw new Error('sem API');
			const resposta = await fetch(new URL('/contato', api), {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ nome: dados.nome, email: dados.email, assunto: dados.assunto, mensagem: dados.mensagem }),
			});
			if (resposta.status === 429) { avisar('amarelo', 'muitas mensagens seguidas · tente daqui a pouco'); return; }
			if (resposta.status === 400) { avisar('vermelho', 'confira os campos'); return; }
			if (!resposta.ok) throw new Error(String(resposta.status));
			avisar('verde', 'mensagem enviada ✓');
			form.reset();
		} catch {
			avisar('vermelho', 'não foi agora · use o e-mail ao lado');
		} finally {
			setEnviando(false);
		}
	}

	return (
		<form className="painel formulario acompanha" noValidate onSubmit={enviar} data-revela="">
			<div className="linha">
				<div className="campo"><label htmlFor="nome">nome</label><input id="nome" name="nome" autoComplete="name" required maxLength={120} placeholder="Como posso te chamar?" /></div>
				<div className="campo"><label htmlFor="email">e-mail</label><input id="email" name="email" type="email" autoComplete="email" required maxLength={200} placeholder="voce@empresa.com" /></div>
			</div>
			<div className="campo"><label htmlFor="assunto">assunto</label><input id="assunto" name="assunto" maxLength={160} placeholder="Parceria, vaga, projeto, dúvida…" /></div>
			<div className="campo"><label htmlFor="mensagem">mensagem</label><textarea id="mensagem" name="mensagem" required maxLength={5000} placeholder="Conta um pouco do que você precisa."></textarea></div>
			<div className="armadilha" aria-hidden="true"><label htmlFor="site">site</label><input id="site" name="site" tabIndex={-1} autoComplete="off" /></div>
			<div className="enviar">
				<small aria-live="polite">{estado ? <span key={estado.vez} ref={pill} className={`pill ${estado.cor}`}>{estado.texto}</span> : 'vai direto pro meu e-mail'}</small>
				<button className="botao primario" type="submit" disabled={enviando}>enviar mensagem <Send /></button>
			</div>
		</form>
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
