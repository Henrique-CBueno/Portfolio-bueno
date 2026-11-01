import { useEffect, useRef, useState } from 'react';

/**
 * Carrossel do celular: devolve a ref da lista e o item que está alinhado no começo,
 * pra barrinha ativa e o "n / total" acompanharem o deslize.
 */
export function useCarrossel<T extends HTMLElement = HTMLDivElement>(total: number) {
	const lista = useRef<T>(null);
	const [atual, setAtual] = useState(0);

	useEffect(() => {
		const el = lista.current;
		if (!el) return;
		setAtual(0);
		const atualizar = () => {
			const itens = Array.from(el.children) as HTMLElement[];
			const inicio = el.getBoundingClientRect().left + parseFloat(getComputedStyle(el).paddingLeft);
			let melhor = 0,
				distancia = Infinity;
			itens.forEach((item, i) => {
				const d = Math.abs(item.getBoundingClientRect().left - inicio);
				if (d < distancia) {
					distancia = d;
					melhor = i;
				}
			});
			// no fim da fila o último pode não alinhar no começo
			if (el.scrollLeft + el.clientWidth >= el.scrollWidth - 4) melhor = itens.length - 1;
			setAtual(melhor);
		};
		el.addEventListener('scroll', atualizar, { passive: true });
		return () => el.removeEventListener('scroll', atualizar);
	}, [total]);

	return [lista, atual] as const;
}
