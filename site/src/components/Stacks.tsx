import { Pill } from './Pill';
import { Titulo } from './Titulo';
import { camadas, arquitetura, ia } from '../dados/stacks';
import './Stacks.css';
import { Card } from './Card';

export function Stacks() {
	return (
		<section className="secao stacks" id="stacks">
			<div className="cab">
				<Titulo antes="Minhas" destaque="stacks" />
				<p data-revela="">Do código à nuvem, camada por camada.</p>
			</div>
			<div className="grade">
				<ol className="cadeia" data-cadeia="">
					{camadas.map((c) => (
						<Card key={c.nome} as="li" className="camada" data-elo="">
							<span className="fio" aria-hidden="true" data-fio=""></span>
							<Pill cor={c.cor}>{c.nome}</Pill>
							<div className="itens">{c.itens.map((i) => <span key={i} className="chip">{i}</span>)}</div>
						</Card>
					))}
				</ol>
				<div className="lado acompanha">
					<Card className="bloco arquitetura" data-revela="">
						<h3>Arquitetura</h3>
						<p>O que mais aparece nos meus vídeos e nos sistemas em que trabalhei.</p>
						<div className="padroes" data-grupo="">{arquitetura.map((a) => <Pill key={a} cor="amarelo">{a}</Pill>)}</div>
					</Card>
					<Card className="bloco" data-revela="">
						<h3>IA no dia a dia</h3>
						<p>Desenvolvimento assistido por IA pra acelerar entrega e revisar código.</p>
						<div className="padroes" data-grupo="">{ia.map((a) => <Pill key={a} cor="roxo">{a}</Pill>)}</div>
					</Card>
				</div>
			</div>
		</section>
	);
}
