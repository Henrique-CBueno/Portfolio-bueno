import { useEffect, useRef } from 'react';
import { animarPagina } from '../scripts/movimento';

/** Ref pro <main> da página: o conteúdo anima quando ela aparece e as animações param quando ela sai. */
export function usePaginaAnimada<T extends HTMLElement = HTMLElement>() {
	const raiz = useRef<T>(null);
	useEffect(() => (raiz.current ? animarPagina(raiz.current) : undefined), []);
	return raiz;
}
