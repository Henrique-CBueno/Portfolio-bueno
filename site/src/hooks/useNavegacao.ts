import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router';
import { cabecalho } from '../lib/cabecalho';

/**
 * Ao navegar sem recarregar: troca título e descrição da aba e rola pro lugar certo
 * (a seção do #hash, ou o topo de uma página nova). Na primeira carga quem cuida disso é o navegador.
 */
export function useNavegacao() {
	const local = useLocation();
	const primeira = useRef(true);

	useEffect(() => {
		const { titulo, descricao } = cabecalho(local.pathname);
		document.title = titulo;
		document.querySelector('meta[name="description"]')?.setAttribute('content', descricao);
	}, [local.pathname]);

	// pela chave: clicar de novo no mesmo link (#sobre) também rola até a seção
	useEffect(() => {
		if (primeira.current) {
			primeira.current = false;
			return;
		}
		const alvo = local.hash ? document.getElementById(decodeURIComponent(local.hash.slice(1))) : null;
		if (alvo) alvo.scrollIntoView();
		else scrollTo({ top: 0, behavior: 'instant' });
	}, [local.key, local.hash]);
}
