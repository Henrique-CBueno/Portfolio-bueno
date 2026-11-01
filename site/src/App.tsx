import { useEffect } from 'react';
import { Route, Routes } from 'react-router';
import { Topo } from './components/Topo';
import { Rodape } from './components/Rodape';
import { Inicio } from './paginas/Inicio';
import { Projeto } from './paginas/Projeto';
import { NaoEncontrada } from './paginas/NaoEncontrada';
import { animarMarca } from './scripts/movimento';
import { iniciarCursor } from './scripts/cursor';
import { useNavegacao } from './hooks/useNavegacao';
import { useSnapshotDaApi } from './hooks/useSnapshotDaApi';
import type { Dados } from './lib/tipos';

/**
 * Rotas: / (início), /projetos/:slug (projeto em destaque) e qualquer outra coisa → 404.
 * Cada uma é gerada como HTML no build (prerender.mjs); o roteador assume a partir daí.
 */
export function App({ dados }: { dados: Dados }) {
	const { geradoEm } = dados;
	// lido uma vez por visita, mesmo navegando entre páginas
	const daApi = useSnapshotDaApi();
	useNavegacao();

	// marca do topo e cursor são do site todo, não de uma página
	useEffect(() => {
		animarMarca();
		iniciarCursor();
	}, []);

	return (
		<>
			<Topo />
			<Routes>
				<Route index element={<Inicio dados={dados} daApi={daApi} />} />
				<Route path="projetos/:slug" element={<Projeto />} />
				<Route path="*" element={<NaoEncontrada />} />
			</Routes>
			<Rodape geradoEm={geradoEm} />
		</>
	);
}
