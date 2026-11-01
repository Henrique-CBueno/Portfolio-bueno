import { Abertura } from '../components/Abertura';
import { Sobre } from '../components/Sobre';
import { Videos } from '../components/Videos';
import { Projetos } from '../components/Projetos';
import { Stacks } from '../components/Stacks';
import { Premiacoes } from '../components/Premiacoes';
import { Contato } from '../components/Contato';
import { usePaginaAnimada } from '../hooks/usePaginaAnimada';
import type { Carga } from '../hooks/useSnapshot';
import type { Snapshot } from '../lib/tipos';

interface Props { geradoEm: string; carga: Carga<Snapshot>; tentarDeNovo: () => void }

export function Inicio({ geradoEm, carga, tentarDeNovo }: Props) {
	const raiz = usePaginaAnimada();
	return (
		<main ref={raiz}>
			<Abertura carga={carga} geradoEm={geradoEm} />
			<Sobre />
			<Videos carga={carga} tentarDeNovo={tentarDeNovo} />
			<Projetos carga={carga} tentarDeNovo={tentarDeNovo} />
			<Stacks />
			<Premiacoes />
			<Contato />
		</main>
	);
}
