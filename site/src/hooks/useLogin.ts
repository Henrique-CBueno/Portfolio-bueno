import { useEffect, useState } from 'react';
import { ehAdmin, entrar, sair, usuarioLogado } from '../services/autenticacao';

/** Onde o login do painel está: só em "pronto" o painel aparece e pede dados à API. */
export type FaseDoLogin = 'entrando' | 'sem-login' | 'sem-permissao' | 'pronto';

/** Login do painel: exige o Keycloak (quem não entrou é redirecionado) e o papel "admin". */
export function useLogin() {
	const [fase, setFase] = useState<FaseDoLogin>('entrando');
	const [usuario, setUsuario] = useState<string>();

	useEffect(() => {
		entrar()
			.then(() => {
				setUsuario(usuarioLogado());
				setFase(ehAdmin() ? 'pronto' : 'sem-permissao');
			})
			// o Keycloak não respondeu: a tela oferece tentar de novo
			.catch(() => setFase('sem-login'));
	}, []);

	return { fase, usuario, sair };
}
