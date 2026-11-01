import { useCallback, useEffect, useState } from 'react';

/**
 * Carrega um dado da API: `dados` (undefined enquanto carrega), `falhou` e `recarregar` (o "tentar de novo").
 * O efeito só busca; quem volta pro estado de carregando é o clique em recarregar, não o efeito.
 * `buscar` precisa ser estável (uma função de services/, não uma criada a cada render).
 */
export function useCarregamento<T>(buscar: () => Promise<T>) {
	const [dados, setDados] = useState<T>();
	const [falhou, setFalhou] = useState(false);
	const [tentativa, setTentativa] = useState(0);

	useEffect(() => {
		let ativo = true;
		buscar()
			.then((d) => {
				if (ativo) setDados(d);
			})
			.catch(() => {
				if (ativo) setFalhou(true);
			});
		return () => {
			ativo = false;
		};
	}, [buscar, tentativa]);

	const recarregar = useCallback(() => {
		setFalhou(false);
		setDados(undefined);
		setTentativa((n) => n + 1);
	}, []);

	return { dados, setDados, falhou, recarregar };
}
