import { Link } from 'react-router';
import { ArrowLeft, ArrowDown } from 'lucide-react';
import { Diagrama } from '../components/Diagrama';
import { Titulo } from '../components/Titulo';
import { usePaginaAnimada } from '../hooks/usePaginaAnimada';
import './NaoEncontrada.css';
import { Botao } from '../components/Botao';
import { Card } from '../components/Card';

/** Qualquer endereço que não existe. No build vira dist/404.html, que o Nginx serve com status 404. */
export function NaoEncontrada() {
	const raiz = usePaginaAnimada();
	return (
		<main ref={raiz} className="nao-encontrada">
			<section className="secao">
				<div className="texto">
					<p className="codigo" data-revela="">404</p>
					<Titulo tag="h1" antes="Essa página" destaque="não existe" />
					<p className="explica" data-revela="">O endereço pode ter mudado ou estar com algum erro de digitação. O resto do site continua no ar.</p>
					<div className="acoes" data-revela="">
						<Botao variante="primario" to="/"><ArrowLeft /> voltar pro início</Botao>
						<Botao to="/#projetos">ver projetos <ArrowDown /></Botao>
					</div>
				</div>
				<Card className="quadro" data-revela="">
					<Diagrama
						nos={[{ nome: 'navegador' }, { nome: 'servidor', cor: 'azul' }]}
						saidas={[{ nome: '404 · não achou', cor: 'amarelo' }, { nome: 'início', cor: 'verde' }]}
						descricao="O navegador pediu a página ao servidor, que respondeu 404 e aponta o caminho de volta pro início."
					/>
				</Card>
			</section>
		</main>
	);
}
