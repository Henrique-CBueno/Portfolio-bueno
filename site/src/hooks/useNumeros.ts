import { useCallback } from 'react';
import { listarContagens, salvarContagem } from '../services/painel';
import { useCarregamento } from './useCarregamento';

/** Os números das redes no painel: os lidos pela API e os digitados (salvar devolve se deu certo). */
export function useNumeros() {
	const { dados: contagens, falhou, recarregar: carregar } = useCarregamento(listarContagens);

	const salvar = useCallback(async (rede: string, valor: number | null) => {
		try {
			await salvarContagem(rede, valor);
			return true;
		} catch {
			return false;
		}
	}, []);

	return { contagens, falhou, carregar, salvar };
}
