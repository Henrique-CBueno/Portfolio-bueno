import { Pill } from './Pill';
import { Titulo } from './Titulo';
import { idiomas } from '../dados/perfil';
import type { Cor } from '../lib/tipos';
import './Sobre.css';

const passos: { rotulo: string; cor: Cor; texto: string }[] = [
	{ rotulo: '1 · o problema', cor: 'vermelho', texto: 'Começo por uma situação que você já viveu, antes de qualquer termo técnico.' },
	{ rotulo: '2 · o conceito', cor: 'amarelo', texto: 'O diagrama anima o sistema por dentro, peça por peça, até o problema fazer sentido.' },
	{ rotulo: '3 · a frase', cor: 'verde', texto: 'Termino com uma linha só, pra você levar pro trabalho.' },
];

export function Sobre() {
	return (
		<section className="secao" id="sobre">
			<div className="sobre">
				<div className="acompanha">
					<Titulo antes="Sobre" className="titulo" />
					<p data-revela="">Sou <b>software engineer</b> focado em backend com <b>Java e Spring Boot</b>, system design e arquitetura distribuída.</p>
					<p data-revela="">Já construí microsserviços, sistemas orientados a eventos e soluções na <b>AWS</b>, e participei de decisões sobre sharding, replicação e consistência, que são justamente os assuntos dos meus vídeos.</p>
					<div className="idiomas" data-grupo="">{idiomas.map((i) => <Pill key={i}>{i}</Pill>)}</div>
				</div>
				<div className="painel metodo acompanha" data-revela="">
					<h3>Como eu explico um conceito</h3>
					<ol data-cadeia="">
						{passos.map((p) => (
							<li key={p.rotulo} className="passo" data-elo="">
								<span className="fio" aria-hidden="true" data-fio=""></span>
								<Pill cor={p.cor}>{p.rotulo}</Pill>
								<p>{p.texto}</p>
							</li>
						))}
					</ol>
					<p className="rodape-metodo"><span>~90 s</span><span>·</span><span>PT-BR</span><span>·</span><span>Instagram, TikTok e YouTube</span></p>
				</div>
			</div>
		</section>
	);
}
