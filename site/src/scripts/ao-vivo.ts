// Contagens ao vivo: a API empurra os números por SSE. Se ela cair, o site
// continua com os números do build e avisa há quanto tempo eles foram lidos.
import { animate } from 'motion';
import { tempoRelativo, textoContagem } from '../lib/formato';
import type { Contagem } from '../lib/tipos';

const api = import.meta.env.PUBLIC_API_URL;
const caixa = document.querySelector<HTMLElement>('[data-lido-em]');

if (api && caixa) {
	let lidoEm = new Date(caixa.dataset.lidoEm!);
	const fonte = new EventSource(new URL('/stream', api));

	fonte.addEventListener('contagens', (evento) => {
		const contagens = JSON.parse((evento as MessageEvent).data) as Contagem[];
		lidoEm = new Date();
		for (const c of contagens) {
			const el = caixa.querySelector<HTMLElement>(`[data-contagem="${c.rede}"]`);
			if (!el || !el.dataset.unidade) continue;
			const texto = textoContagem(c, el.dataset.unidade);
			if (texto === null) continue;
			if (el.textContent === texto) continue;
			el.textContent = texto;
			el.classList.add('mudou');
			animate(el, { y: [-4, 0] }, { duration: 0.3 });
			setTimeout(() => el.classList.remove('mudou'), 1500);
		}
	});

	fonte.addEventListener('error', () => {
		caixa.querySelectorAll<HTMLElement>('[data-unidade]').forEach((el) => {
			el.title = `último valor · ${tempoRelativo(lidoEm)}`;
		});
	});
}
