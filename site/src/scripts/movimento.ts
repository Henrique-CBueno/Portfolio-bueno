// Animações com Motion. Tudo aqui é decoração: sem JS, ou com
// prefers-reduced-motion, a página aparece inteira e parada (ver global.css).
import { animate, inView, scroll, stagger } from 'motion';

const sobe = [0.2, 0.8, 0.2, 1] as const;
const mola = { type: 'spring', bounce: 0.35, duration: 0.8 } as const;

const todos = <T extends Element = HTMLElement>(seletor: string, raiz: ParentNode = document) =>
	Array.from(raiz.querySelectorAll<T & Element>(seletor)) as T[];

function palavras(titulo: Element, atraso = 0) {
	return animate(todos('.palavra > span', titulo), { y: ['105%', '0%'] }, { duration: 0.7, ease: sobe, delay: stagger(0.07, { startDelay: atraso }) });
}

function contar(el: HTMLElement, atraso: number) {
	const alvo = Number(el.dataset.conta);
	el.textContent = '0';
	animate(0, alvo, { duration: 1.2, delay: atraso, ease: 'easeOut', onUpdate: (v) => (el.textContent = String(Math.round(v))) });
}

/** Abertura: a foto entra, os cards "colam" por cima e o nome sobe como legenda. */
function abertura() {
	animate('[data-foto]', { opacity: [0, 1], scale: [1.06, 1] }, { duration: 0.9, ease: sobe });
	const [nome, papel] = todos('.abertura [data-palavras]');
	if (nome) palavras(nome, 0.15);
	if (papel) palavras(papel, 0.45);
	const cards = animate('.abertura [data-colado]', { opacity: [0, 1], y: [-28, 0], scale: [1.18, 1] }, { ...mola, delay: stagger(0.14, { startDelay: 0.55 }) });
	const carimbo = animate('.abertura [data-carimbo]', { opacity: [0, 1], scale: [1.9, 1] }, { type: 'spring', bounce: 0.5, duration: 0.7, delay: 0.95 });
	Promise.all([cards, carimbo]).then(flutuar);
	animate('[data-entra]', { opacity: [0, 1], y: [16, 0] }, { duration: 0.6, ease: sobe, delay: stagger(0.08, { startDelay: 0.6 }) });
	todos('.abertura [data-conta]').forEach((el, i) => contar(el, 0.85 + i * 0.1));
}

/**
 * Depois da entrada, a foto não fica parada: os cards colados flutuam, cada um
 * no seu ritmo, a foto "respira" e tudo inclina acompanhando o mouse.
 * Só roda enquanto a abertura está na tela.
 */
function flutuar() {
	const retrato = document.querySelector<HTMLElement>('[data-retrato]');
	if (!retrato) return;
	const loops = [
		...todos('[data-colado]', retrato).map((el, i) => animate(el, { y: [0, i ? 7 : -7, 0] }, { duration: 4.2 + i * 0.9, ease: 'easeInOut', repeat: Infinity })),
		animate(retrato.querySelector('[data-carimbo]')!, { y: [0, -4, 0] }, { duration: 3.4, ease: 'easeInOut', repeat: Infinity, delay: 0.6 }),
		animate(retrato.querySelector('[data-foto] img')!, { scale: [1, 1.035, 1] }, { duration: 9, ease: 'easeInOut', repeat: Infinity }),
	];
	inView(retrato, () => {
		loops.forEach((a) => a.play());
		return () => loops.forEach((a) => a.pause());
	});

	if (!matchMedia('(pointer: fine)').matches) return;
	// inclinação 3D: segue o mouse em qualquer ponto da abertura, com suavização
	const area = retrato.closest('.abertura') as HTMLElement;
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
	area.addEventListener('pointermove', (e) => {
		const r = retrato.getBoundingClientRect();
		mover((e.clientX - (r.left + r.width / 2)) / (r.width * 0.9), (e.clientY - (r.top + r.height / 2)) / (r.height * 0.9));
	});
	area.addEventListener('pointerleave', () => mover(0, 0));
}

/** Títulos de seção, blocos e grupos aparecem quando entram na tela. */
function revelacoes() {
	inView('main > section [data-palavras]', (el) => { palavras(el); }, { amount: 0.6 });
	inView('[data-revela]', (el) => { animate(el, { opacity: [0, 1], y: [24, 0] }, { duration: 0.7, ease: sobe }); }, { amount: 0.25 });
	inView('[data-grupo]', (el) => {
		animate(Array.from(el.children), { opacity: [0, 1], y: [20, 0] }, { duration: 0.6, ease: sobe, delay: stagger(0.06) });
	}, { amount: 0.15 });
}

/** Cadeias (stacks, "como eu explico"): cada elo acende depois do fio que liga ao anterior. */
function cadeias() {
	inView('[data-cadeia]', (cadeia) => {
		todos('[data-elo]', cadeia).forEach((elo, i) => {
			const atraso = i * 0.12;
			const fio = elo.querySelector('[data-fio]');
			if (fio) animate(fio, { scaleY: [0, 1] }, { duration: 0.25, delay: atraso, ease: 'easeOut' });
			animate(elo, { opacity: [0, 1], x: [-14, 0] }, { duration: 0.5, ease: sobe, delay: atraso + 0.1 });
			const chips = todos('.chip', elo);
			if (chips.length) animate(chips, { opacity: [0, 1], y: [6, 0] }, { duration: 0.35, delay: stagger(0.035, { startDelay: atraso + 0.25 }) });
		});
	}, { amount: 0.15 });
}

/** Diagramas: nós e fios aparecem em sequência; depois os pacotes correm enquanto está na tela. */
function diagramas() {
	inView('[data-diagrama]', (diagrama) => {
		const nos = todos('[data-no]', diagrama);
		const fios = todos('[data-fio-h]', diagrama);
		animate(nos, { opacity: [0, 1], scale: [0.8, 1] }, { ...mola, delay: stagger(0.16) });
		animate(fios, { opacity: [0, 1], scaleX: [0, 1] }, { duration: 0.3, ease: 'easeOut', delay: stagger(0.16, { startDelay: 0.12 }) });
		const pacotes = todos('[data-pacote]', diagrama).map((p, i) => {
			const largura = (p.parentElement?.offsetWidth ?? 26) - 6;
			return animate(p, { x: [0, largura], opacity: [0, 1, 1, 0] }, { duration: 0.7, ease: 'easeInOut', delay: 0.9 + i * 0.35, repeat: Infinity, repeatDelay: 0.35 * (fios.length - 1) + 0.6 });
		});
		return () => pacotes.forEach((a) => a.stop());
	}, { amount: 0.4 });
}

/** Prints dos projetos andam um pouco dentro da janela enquanto a página rola. */
function paralaxe() {
	todos<HTMLImageElement>('[data-paralaxe]').forEach((img) => {
		const janela = img.closest('[data-print]');
		if (!janela) return;
		scroll(animate(img, { y: ['0%', '-7%'] }, { ease: 'linear' }), { target: janela, offset: ['start end', 'end start'] });
	});
}

/** Carimbos de prêmio "batem" no card quando ele aparece. */
function carimbos() {
	inView('.premio', (card) => {
		const carimbo = card.querySelector('[data-carimbo]');
		if (carimbo) animate(carimbo, { opacity: [0, 1], scale: [2, 1] }, { type: 'spring', bounce: 0.45, duration: 0.6, delay: 0.35 });
	}, { amount: 0.4 });
}

if (!matchMedia('(prefers-reduced-motion: reduce)').matches) {
	abertura();
	revelacoes();
	cadeias();
	diagramas();
	paralaxe();
	carimbos();
}
