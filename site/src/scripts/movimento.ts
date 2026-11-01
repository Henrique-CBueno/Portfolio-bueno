// Animações com Motion. Tudo aqui é decoração: sem JS, ou com
// prefers-reduced-motion, a página aparece inteira e parada (ver global.css).
// A marca do topo anima uma vez (animarMarca, no App); o conteúdo de cada página anima quando ela
// entra na tela (animarPagina, chamado pela própria página), inclusive ao navegar sem recarregar.
import { animate, inView, scroll, stagger } from 'motion';

const sobe = [0.2, 0.8, 0.2, 1] as const;
const mola = { type: 'spring', bounce: 0.35, duration: 0.8 } as const;

type Parar = () => void;

const reduzido = () => matchMedia('(prefers-reduced-motion: reduce)').matches;

const todos = <T extends Element = HTMLElement>(seletor: string, raiz: ParentNode = document) =>
	Array.from(raiz.querySelectorAll<T & Element>(seletor)) as T[];

/** inView só com os elementos que existem nesta página. */
function aoAparecer(elementos: Element[], aoEntrar: Parameters<typeof inView>[1], opcoes: Parameters<typeof inView>[2], paradas: Parar[]) {
	if (elementos.length) paradas.push(inView(elementos, aoEntrar, opcoes));
}

function palavras(titulo: Element, atraso = 0) {
	return animate(todos('.palavra > span', titulo), { y: ['105%', '0%'] }, { duration: 0.7, ease: sobe, delay: stagger(0.07, { startDelay: atraso }) });
}

function contar(el: HTMLElement, atraso: number) {
	const alvo = Number(el.dataset.conta);
	el.textContent = '0';
	animate(0, alvo, { duration: 1.2, delay: atraso, ease: 'easeOut', onUpdate: (v) => (el.textContent = String(Math.round(v))) });
}

/** Marca do topo: os sinais < e /> saem do centro e abrem espaço pro nome. Uma vez por carregamento. */
export function animarMarca() {
	const raiz = document.documentElement;
	// o Fast Refresh do dev pode rodar o efeito de novo
	if (raiz.dataset.marcaAnimada || reduzido()) return;
	raiz.dataset.marcaAnimada = 'sim';
	const nome = document.querySelector<HTMLElement>('[data-marca-nome]');
	if (!nome) return;
	const meio = nome.offsetWidth / 2 + 4;
	animate(nome, { clipPath: ['inset(0 50% 0 50%)', 'inset(0 0% 0 0%)'] }, { duration: 0.8, ease: sobe, delay: 0.1 });
	animate('[data-marca-esq]', { x: [meio, 0] }, { duration: 0.8, ease: sobe, delay: 0.1 });
	animate('[data-marca-dir]', { x: [-meio, 0] }, { duration: 0.8, ease: sobe, delay: 0.1 });
}

/** Abertura: a foto entra, os cards "colam" por cima e o nome sobe como legenda. */
function abertura(raiz: HTMLElement, paradas: Parar[]) {
	const area = raiz.querySelector<HTMLElement>('.abertura');
	if (!area) return;
	animate(todos('[data-foto]', area), { opacity: [0, 1], scale: [1.06, 1] }, { duration: 0.9, ease: sobe });
	const [nome, papel] = todos('[data-palavras]', area);
	if (nome) palavras(nome, 0.15);
	if (papel) palavras(papel, 0.45);
	const cards = animate(todos('[data-colado]', area), { opacity: [0, 1], y: [-28, 0], scale: [1.18, 1] }, { ...mola, delay: stagger(0.14, { startDelay: 0.55 }) });
	const carimbo = animate(todos('[data-carimbo]', area), { opacity: [0, 1], scale: [1.9, 1] }, { type: 'spring', bounce: 0.5, duration: 0.7, delay: 0.95 });
	let saiu = false;
	paradas.push(() => { saiu = true; });
	Promise.all([cards, carimbo]).then(() => { if (!saiu) flutuar(area, paradas); });
	animate(todos('[data-entra]', area), { opacity: [0, 1], y: [16, 0] }, { duration: 0.6, ease: sobe, delay: stagger(0.08, { startDelay: 0.6 }) });
	todos('[data-conta]', area).forEach((el, i) => contar(el, 0.85 + i * 0.1));
}

/**
 * Depois da entrada, a foto não fica parada: os cards colados flutuam, cada um
 * no seu ritmo, a foto "respira" e tudo inclina acompanhando o mouse.
 * Só roda enquanto a abertura está na tela.
 */
function flutuar(area: HTMLElement, paradas: Parar[]) {
	const retrato = area.querySelector<HTMLElement>('[data-retrato]');
	if (!retrato) return;
	const loops = [
		...todos('[data-colado]', retrato).map((el, i) => animate(el, { y: [0, i ? 7 : -7, 0] }, { duration: 4.2 + i * 0.9, ease: 'easeInOut', repeat: Infinity })),
		animate(retrato.querySelector('[data-carimbo]')!, { y: [0, -4, 0] }, { duration: 3.4, ease: 'easeInOut', repeat: Infinity, delay: 0.6 }),
		animate(retrato.querySelector('[data-foto] img')!, { scale: [1, 1.035, 1] }, { duration: 9, ease: 'easeInOut', repeat: Infinity }),
	];
	paradas.push(inView(retrato, () => {
		loops.forEach((a) => a.play());
		return () => loops.forEach((a) => a.pause());
	}));
	paradas.push(() => loops.forEach((a) => a.stop()));

	if (!matchMedia('(pointer: fine)').matches) return;
	// inclinação 3D: segue o mouse em qualquer ponto da abertura, com suavização
	let alvoX = 0, alvoY = 0, x = 0, y = 0, quadro = 0;
	const passo = () => {
		x += (alvoX - x) * 0.08;
		y += (alvoY - y) * 0.08;
		retrato.style.transform = `perspective(1000px) rotateY(${x * 7}deg) rotateX(${-y * 6}deg)`;
		retrato.style.setProperty('--px', x.toFixed(3));
		retrato.style.setProperty('--py', y.toFixed(3));
		quadro = Math.abs(alvoX - x) + Math.abs(alvoY - y) > 0.001 ? requestAnimationFrame(passo) : 0;
	};
	const mover = (nx: number, ny: number) => {
		alvoX = Math.max(-1, Math.min(1, nx));
		alvoY = Math.max(-1, Math.min(1, ny));
		if (!quadro) quadro = requestAnimationFrame(passo);
	};
	const aoMover = (e: PointerEvent) => {
		const r = retrato.getBoundingClientRect();
		mover((e.clientX - (r.left + r.width / 2)) / (r.width * 0.9), (e.clientY - (r.top + r.height / 2)) / (r.height * 0.9));
	};
	const aoSair = () => mover(0, 0);
	area.addEventListener('pointermove', aoMover);
	area.addEventListener('pointerleave', aoSair);
	paradas.push(() => {
		area.removeEventListener('pointermove', aoMover);
		area.removeEventListener('pointerleave', aoSair);
		cancelAnimationFrame(quadro);
	});
}

/** Títulos, blocos e grupos aparecem quando entram na tela. */
function revelacoes(raiz: HTMLElement, paradas: Parar[]) {
	// os títulos da abertura têm a entrada própria
	const titulos = todos('[data-palavras]', raiz).filter((el) => !el.closest('.abertura'));
	aoAparecer(titulos, (el) => { palavras(el); }, { amount: 0.6 }, paradas);
	aoAparecer(todos('[data-revela]', raiz), (el) => { animate(el, { opacity: [0, 1], y: [24, 0] }, { duration: 0.7, ease: sobe }); }, { amount: 0.25 }, paradas);
	aoAparecer(todos('[data-grupo]', raiz), (el) => {
		animate(Array.from(el.children), { opacity: [0, 1], y: [20, 0] }, { duration: 0.6, ease: sobe, delay: stagger(0.06) });
	}, { amount: 0.15 }, paradas);
}

/** Cadeias (stacks, "como eu explico"): cada elo acende depois do fio que liga ao anterior. */
function cadeias(raiz: HTMLElement, paradas: Parar[]) {
	aoAparecer(todos('[data-cadeia]', raiz), (cadeia) => {
		todos('[data-elo]', cadeia).forEach((elo, i) => {
			const atraso = i * 0.12;
			const fio = elo.querySelector('[data-fio]');
			if (fio) animate(fio, { scaleY: [0, 1] }, { duration: 0.25, delay: atraso, ease: 'easeOut' });
			animate(elo, { opacity: [0, 1], x: [-14, 0] }, { duration: 0.5, ease: sobe, delay: atraso + 0.1 });
			const chips = todos('.chip', elo);
			if (chips.length) animate(chips, { opacity: [0, 1], y: [6, 0] }, { duration: 0.35, delay: stagger(0.035, { startDelay: atraso + 0.25 }) });
		});
	}, { amount: 0.15 }, paradas);
}

/** Diagramas: nós e fios aparecem em sequência; depois os pacotes correm enquanto está na tela. */
function diagramas(raiz: HTMLElement, paradas: Parar[]) {
	aoAparecer(todos('[data-diagrama]', raiz), (diagrama) => {
		const nos = todos('[data-no]', diagrama);
		const fios = todos('[data-fio-h]', diagrama);
		animate(nos, { opacity: [0, 1], scale: [0.8, 1] }, { ...mola, delay: stagger(0.16) });
		animate(fios, { opacity: [0, 1], scaleX: [0, 1] }, { duration: 0.3, ease: 'easeOut', delay: stagger(0.16, { startDelay: 0.12 }) });
		const pacotes = todos('[data-pacote]', diagrama).map((p, i) => {
			const largura = (p.parentElement?.offsetWidth ?? 26) - 6;
			return animate(p, { x: [0, largura], opacity: [0, 1, 1, 0] }, { duration: 0.7, ease: 'easeInOut', delay: 0.9 + i * 0.35, repeat: Infinity, repeatDelay: 0.35 * (fios.length - 1) + 0.6 });
		});
		return () => pacotes.forEach((a) => a.stop());
	}, { amount: 0.4 }, paradas);
}

/** Prints dos projetos andam um pouco dentro da janela enquanto a página rola. */
function paralaxe(raiz: HTMLElement, paradas: Parar[]) {
	todos<HTMLImageElement>('[data-paralaxe]', raiz).forEach((img) => {
		const janela = img.closest('[data-print]');
		if (!janela) return;
		paradas.push(scroll(animate(img, { y: ['0%', '-7%'] }, { ease: 'linear' }), { target: janela, offset: ['start end', 'end start'] }));
	});
}

/** Carimbos de prêmio "batem" no card quando ele aparece. */
function carimbos(raiz: HTMLElement, paradas: Parar[]) {
	aoAparecer(todos('.premio', raiz), (card) => {
		const carimbo = card.querySelector('[data-carimbo]');
		if (carimbo) animate(carimbo, { opacity: [0, 1], scale: [2, 1] }, { type: 'spring', bounce: 0.45, duration: 0.6, delay: 0.35 });
	}, { amount: 0.4 }, paradas);
}

/** Anima o conteúdo de uma página (o <main> dela). Devolve como parar tudo, pra quando ela sai da tela. */
export function animarPagina(raiz: HTMLElement): Parar {
	if (reduzido()) return () => {};
	const paradas: Parar[] = [];
	abertura(raiz, paradas);
	revelacoes(raiz, paradas);
	cadeias(raiz, paradas);
	diagramas(raiz, paradas);
	paralaxe(raiz, paradas);
	carimbos(raiz, paradas);
	return () => paradas.forEach((parar) => parar());
}
