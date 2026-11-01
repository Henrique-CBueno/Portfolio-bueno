import { Trophy, Calendar, MapPin } from 'lucide-react';
import { Img } from './Img';
import { Pill } from './Pill';
import { Titulo } from './Titulo';
import { premios } from '../dados/premios';
import './Premiacoes.css';
import { Card } from './Card';

const vitorias = premios.filter((p) => p.colocacao.startsWith('1')).length;
const comFoto = premios.filter((p) => p.foto);
const semFoto = premios.filter((p) => !p.foto);

export function Premiacoes() {
	return (
		<section className="secao premiacoes" id="premiacoes">
			<div className="premios">
				<div className="acompanha">
					<Titulo className="legenda" antes="Primeiro lugar em" destaque={`${vitorias} hackathons`} />
					<p className="apoio" data-revela="">
						Prazo curto e problema de verdade: o mesmo tipo de pressão dos sistemas que eu explico nos vídeos.
					</p>
				</div>
				<div className="lista">
					{comFoto.map((p) => (
						<Card key={p.evento} as="article" className="premio principal" data-revela="">
							<span className="carimbo" data-carimbo="">
								<Trophy />
								{p.colocacao}
							</span>
							<div className="foto">{p.foto && <Img imagem={p.foto.imagem} alt={p.foto.alt} sizes="(max-width: 960px) 92vw, 380px" />}</div>
							<div className="corpo">
								<p className="quando">
									<Calendar />
									{p.quando}
								</p>
								<h3>{p.evento}</h3>
								{p.projeto && (
									<p>
										{p.projeto.nome && <b>{p.projeto.nome}: </b>}
										{p.projeto.descricao}
									</p>
								)}
								{p.contexto && (
									<p className="contexto">
										{p.contexto.texto} <b>{p.contexto.destaque}</b> {p.contexto.depois}
									</p>
								)}
								<div className="orgs">
									{p.organizadores.map((o) => (
										<Pill key={o.nome} cor={o.cor}>
											{o.nome}
										</Pill>
									))}
								</div>
							</div>
						</Card>
					))}
					{semFoto.map((p) => (
						<Card key={p.evento} as="article" className="premio compacto" data-revela="">
							<span className="ic">
								<Trophy />
							</span>
							<div className="texto">
								<p className="quando">
									{p.onde ? <MapPin /> : <Calendar />}
									{p.onde ?? p.quando}
								</p>
								<h3>{p.evento}</h3>
								{p.projeto && <p>{p.projeto.descricao}</p>}
							</div>
							<div className="lateral">
								<Pill cor="amarelo">{p.colocacao}</Pill>
								{p.organizadores.map((o) => (
									<Pill key={o.nome} cor={o.cor}>
										{o.nome}
									</Pill>
								))}
							</div>
						</Card>
					))}
				</div>
			</div>
		</section>
	);
}
