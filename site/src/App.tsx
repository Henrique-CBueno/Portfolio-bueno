import { useEffect } from 'react';
import { Topo } from './components/Topo';
import { Abertura } from './components/Abertura';
import { Sobre } from './components/Sobre';
import { Videos } from './components/Videos';
import { Projetos } from './components/Projetos';
import { Stacks } from './components/Stacks';
import { Premiacoes } from './components/Premiacoes';
import { Contato } from './components/Contato';
import { Rodape } from './components/Rodape';
import { iniciarMovimento } from './scripts/movimento';
import { iniciarCursor } from './scripts/cursor';
import type { Dados } from './lib/tipos';

export function App({ dados }: { dados: Dados }) {
	const { snapshot, geradoEm } = dados;

	// animações e cursor são decoração sobre o HTML já hidratado (efeitos dos filhos rodam antes deste)
	useEffect(() => {
		iniciarMovimento();
		iniciarCursor();
	}, []);

	return (
		<>
			<Topo />
			<main>
				<Abertura contagens={snapshot.contagens} lidoEm={snapshot.lidoEm} geradoEm={geradoEm} />
				<Sobre />
				<Videos videos={snapshot.videos} assinatura={dados.assinatura} geradoEm={geradoEm} />
				<Projetos repositorios={snapshot.repositorios} />
				<Stacks />
				<Premiacoes />
				<Contato />
			</main>
			<Rodape geradoEm={geradoEm} />
		</>
	);
}
