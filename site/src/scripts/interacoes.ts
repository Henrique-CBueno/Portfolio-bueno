import { animate } from 'motion';
import { tempoRelativo } from '../lib/formato';

const reduzido = matchMedia('(prefers-reduced-motion: reduce)').matches;

/* datas relativas: recalculadas no navegador pra não envelhecer entre um build e outro */
document.querySelectorAll<HTMLTimeElement>('[data-relativo]').forEach((t) => {
	t.textContent = tempoRelativo(new Date(t.dateTime));
});

/* topo: fundo ao rolar e marcador na seção atual */
const topo = document.querySelector<HTMLElement>('[data-topo]');
const marcador = document.querySelector<HTMLElement>('[data-marcador]');
const links = new Map(Array.from(document.querySelectorAll<HTMLAnchorElement>('[data-link-secao]')).map((a) => [a.dataset.linkSecao!, a]));

const aoRolar = () => topo?.classList.toggle('rolou', scrollY > 8);
addEventListener('scroll', aoRolar, { passive: true });
aoRolar();

function marcar(id: string | null) {
	links.forEach((a, chave) => a.classList.toggle('ativo', chave === id));
	if (!marcador) return;
	const link = id ? links.get(id) : undefined;
	if (!link) {
		animate(marcador, { opacity: 0 }, { duration: reduzido ? 0 : 0.2 });
		return;
	}
	animate(marcador, { opacity: 1, x: link.offsetLeft, width: link.offsetWidth }, reduzido ? { duration: 0 } : { type: 'spring', bounce: 0.2, duration: 0.5 });
}

const observador = new IntersectionObserver((entradas) => {
	for (const e of entradas) if (e.isIntersecting) marcar(e.target.id);
}, { rootMargin: '-45% 0px -50% 0px' });
links.forEach((_, id) => { const s = document.getElementById(id); if (s) observador.observe(s); });
new IntersectionObserver(([e]) => { if (e.isIntersecting) marcar(null); }, { rootMargin: '-45% 0px -50% 0px' })
	.observe(document.getElementById('inicio')!);

/* e-mail copiável */
const botaoEmail = document.querySelector<HTMLButtonElement>('[data-copiar]');
if (botaoEmail) {
	const estado = botaoEmail.querySelector<HTMLElement>('[data-copiar-estado]')!;
	const icCopiar = estado.querySelector<HTMLElement>('[data-icone-copiar]')!;
	const icOk = estado.querySelector<HTMLElement>('[data-icone-ok]')!;
	const texto = estado.querySelector<HTMLElement>('[data-copiar-texto]')!;
	let volta: number | undefined;
	const mostrar = (copiado: boolean) => {
		estado.classList.toggle('verde', copiado);
		estado.classList.toggle('neutro', !copiado);
		icCopiar.hidden = copiado;
		icOk.hidden = !copiado;
		texto.textContent = copiado ? 'copiado' : 'copiar';
	};
	botaoEmail.addEventListener('click', async () => {
		try { await navigator.clipboard.writeText(botaoEmail.dataset.copiar!); } catch { /* sem permissão: o e-mail continua visível */ }
		mostrar(true);
		if (!reduzido) animate(estado, { scale: [0.8, 1] }, { type: 'spring', bounce: 0.5, duration: 0.4 });
		clearTimeout(volta);
		volta = window.setTimeout(() => mostrar(false), 2200);
	});
}

/* formulário de contato → POST /contato na API */
const form = document.querySelector<HTMLFormElement>('[data-formulario]');
if (form) {
	const estado = form.querySelector<HTMLElement>('[data-estado]')!;
	const botao = form.querySelector<HTMLButtonElement>('button[type="submit"]')!;
	const pill = (cor: string, texto: string) => {
		estado.innerHTML = '';
		const p = document.createElement('span');
		p.className = `pill ${cor}`;
		p.textContent = texto;
		estado.append(p);
		if (!reduzido) animate(p, { opacity: [0, 1], y: [6, 0] }, { duration: 0.3 });
	};

	form.addEventListener('submit', async (evento) => {
		evento.preventDefault();
		if (!form.checkValidity()) { form.reportValidity(); return; }
		const dados = Object.fromEntries(new FormData(form)) as Record<string, string>;
		if (dados.site) { pill('verde', 'mensagem enviada ✓'); form.reset(); return; }

		const api = form.dataset.api;
		botao.disabled = true;
		pill('amarelo', 'enviando…');
		try {
			if (!api) throw new Error('sem API');
			const resposta = await fetch(new URL('/contato', api), {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ nome: dados.nome, email: dados.email, assunto: dados.assunto, mensagem: dados.mensagem }),
			});
			if (resposta.status === 429) { pill('amarelo', 'muitas mensagens seguidas · tente daqui a pouco'); return; }
			if (resposta.status === 400) { pill('vermelho', 'confira os campos'); return; }
			if (!resposta.ok) throw new Error(String(resposta.status));
			pill('verde', 'mensagem enviada ✓');
			form.reset();
		} catch {
			pill('vermelho', 'não foi agora · use o e-mail ao lado');
		} finally {
			botao.disabled = false;
		}
	});
}

/* carrosséis do celular: barrinha ativa e "n / total" acompanham o deslize */
document.querySelectorAll<HTMLElement>('[data-carrossel]').forEach((lista) => {
	const indicador = document.querySelector<HTMLElement>(`[data-indicador="${lista.id}"]`);
	if (!indicador) return;
	const contador = indicador.querySelector('span')!;
	let atual = 0;
	const atualizar = () => {
		// a lista de vídeos pode ser redesenhada depois do carregamento (ver Videos.astro)
		const barras = Array.from(indicador.querySelectorAll('i'));
		const itens = Array.from(lista.children) as HTMLElement[];
		const inicio = lista.getBoundingClientRect().left + parseFloat(getComputedStyle(lista).paddingLeft);
		let melhor = 0, distancia = Infinity;
		itens.forEach((item, i) => {
			const d = Math.abs(item.getBoundingClientRect().left - inicio);
			if (d < distancia) { distancia = d; melhor = i; }
		});
		// no fim da fila o último pode não alinhar no começo
		if (lista.scrollLeft + lista.clientWidth >= lista.scrollWidth - 4) melhor = itens.length - 1;
		if (melhor === atual) return;
		atual = melhor;
		barras.forEach((b, i) => b.classList.toggle('ativo', i === atual));
		contador.textContent = `${atual + 1} / ${itens.length}`;
	};
	lista.addEventListener('scroll', atualizar, { passive: true });
});
