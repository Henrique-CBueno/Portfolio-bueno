// Cursor no estilo dos diagramas: um pacote amarelo que segue o mouse na hora,
// um anel que vem atrás com atraso, e a grade do fundo acendendo em volta.
// Só com mouse de verdade e sem preferência por menos movimento.

const ligar = matchMedia('(pointer: fine)').matches && !matchMedia('(prefers-reduced-motion: reduce)').matches;

if (ligar) {
	const cursor = document.createElement('div');
	cursor.className = 'cursor fora';
	cursor.setAttribute('aria-hidden', 'true');
	cursor.innerHTML = '<span class="cursor-anel"><span class="cursor-rotulo"></span></span><span class="cursor-ponto"></span>';
	const luz = document.createElement('div');
	luz.className = 'luz-grade';
	luz.setAttribute('aria-hidden', 'true');
	document.body.append(luz, cursor);
	document.documentElement.classList.add('cursor-ativo');

	const ponto = cursor.querySelector<HTMLElement>('.cursor-ponto')!;
	const anel = cursor.querySelector<HTMLElement>('.cursor-anel')!;
	const rotulo = cursor.querySelector<HTMLElement>('.cursor-rotulo')!;
	const raiz = document.documentElement;

	let mx = -100, my = -100, ax = -100, ay = -100, quadro = 0, escala = 1;
	const passo = () => {
		ax += (mx - ax) * 0.2;
		ay += (my - ay) * 0.2;
		anel.style.transform = `translate3d(${ax}px, ${ay}px, 0) scale(${escala})`;
		quadro = Math.abs(mx - ax) + Math.abs(my - ay) > 0.1 ? requestAnimationFrame(passo) : 0;
	};

	addEventListener('pointermove', (e) => {
		if (e.pointerType !== 'mouse') return;
		mx = e.clientX;
		my = e.clientY;
		ponto.style.transform = `translate3d(${mx}px, ${my}px, 0)`;
		raiz.style.setProperty('--mx', `${mx}px`);
		raiz.style.setProperty('--my', `${my}px`);
		cursor.classList.remove('fora');
		if (!quadro) quadro = requestAnimationFrame(passo);
	}, { passive: true });

	document.addEventListener('pointerleave', () => cursor.classList.add('fora'));

	// estados: sobre links e botões o anel cresce; com data-cursor ele vira uma etiqueta
	document.addEventListener('pointerover', (e) => {
		const alvo = e.target as Element;
		const comRotulo = alvo.closest<HTMLElement>('[data-cursor]');
		const campo = alvo.closest('input, textarea');
		const link = alvo.closest('a, button, [role="button"], label');
		cursor.classList.toggle('rotulo', !!comRotulo);
		cursor.classList.toggle('link', !comRotulo && !!link);
		cursor.classList.toggle('escondido', !!campo);
		if (comRotulo) rotulo.textContent = comRotulo.dataset.cursor!;
	});

	// clique: o anel "aperta" e volta
	addEventListener('pointerdown', () => { escala = 0.8; if (!quadro) quadro = requestAnimationFrame(passo); });
	addEventListener('pointerup', () => { escala = 1; if (!quadro) quadro = requestAnimationFrame(passo); });
}
