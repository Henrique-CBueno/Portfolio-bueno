import { useCallback } from 'react';
import { apagarMensagem, listarMensagens, marcarMensagem } from '../services/painel';
import { useCarregamento } from './useCarregamento';

/** Mensagens do formulário no painel: carregar, marcar (lida/respondida) e apagar, com a lista sempre em dia. */
export function useMensagens() {
	const { dados: mensagens, setDados: setMensagens, falhou, recarregar: carregar } = useCarregamento(listarMensagens);

	const marcar = useCallback(
		async (id: string, marca: 'lida' | 'respondida', valor: boolean) => {
			const nova = await marcarMensagem(id, marca, valor);
			setMensagens((lista) => lista?.map((m) => (m.id === nova.id ? nova : m)));
		},
		[setMensagens],
	);

	const apagar = useCallback(
		async (id: string) => {
			await apagarMensagem(id);
			setMensagens((lista) => lista?.filter((m) => m.id !== id));
		},
		[setMensagens],
	);

	const novas = mensagens?.filter((m) => !m.lida).length ?? 0;
	const semResposta = mensagens?.filter((m) => !m.respondida).length ?? 0;
	return { mensagens, falhou, carregar, marcar, apagar, novas, semResposta };
}
