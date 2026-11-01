import { Abertura } from '../components/Abertura';
import { Sobre } from '../components/Sobre';
import { Videos } from '../components/Videos';
import { Projetos } from '../components/Projetos';
import { Stacks } from '../components/Stacks';
import { Premiacoes } from '../components/Premiacoes';
import { Contato } from '../components/Contato';
import { usePaginaAnimada } from '../hooks/usePaginaAnimada';
import type { Dados, Snapshot } from '../lib/tipos';

export function Inicio({ dados, daApi }: { dados: Dados; daApi: Snapshot | null }) {
	const { snapshot, geradoEm } = dados;
	const raiz = usePaginaAnimada();
	return (
		<main ref={raiz}>
			<Abertura contagens={snapshot.contagens} lidoEm={snapshot.lidoEm} geradoEm={geradoEm} />
			<Sobre />
			<Videos videos={snapshot.videos} assinatura={dados.assinatura} geradoEm={geradoEm} daApi={daApi} />
			<Projetos repositorios={snapshot.repositorios} daApi={daApi} />
			<Stacks />
			<Premiacoes />
			<Contato />
		</main>
	);
}
