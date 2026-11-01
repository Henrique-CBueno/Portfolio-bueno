// fontes e CSS base aqui (e não no main.tsx): assim o servidor também os enxerga e, no dev,
// a página já chega estilizada (ver cssDaPagina no vite.config.ts)
import '@fontsource-variable/inter';
import '@fontsource-variable/jetbrains-mono';
import './styles/global.css';
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
import { useSnapshot } from './hooks/useSnapshot';
import type { Dados } from './lib/tipos';

/**
 * Rotas: / (início), /projetos/:slug (projeto em destaque) e qualquer outra coisa → 404.
 * Cada uma é gerada como HTML no build (prerender.mjs, só com o que é fixo); o roteador assume a partir daí.
 */
export function App({ dados }: { dados: Dados }) {
	const { geradoEm } = dados;
	// vídeos, seguidores e repositórios: lidos da API uma vez por visita, mesmo navegando entre páginas
	const { carga, tentarDeNovo } = useSnapshot();
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
				<Route index element={<Inicio geradoEm={geradoEm} carga={carga} tentarDeNovo={tentarDeNovo} />} />
				<Route path="projetos/:slug" element={<Projeto />} />
				<Route path="*" element={<NaoEncontrada />} />
			</Routes>
			<Rodape geradoEm={geradoEm} />
		</>
	);
}
