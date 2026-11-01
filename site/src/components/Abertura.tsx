import { useEffect, useRef, useState } from 'react';
import { animate } from 'motion';
import { Coffee, Cloud, AtSign, ArrowDown, Send, MapPin } from 'lucide-react';
import fotoPicture from '../assets/foto.jpg?w=340;460;680;920&format=webp&as=picture';
import { Img } from './Img';
import { Marca } from './Marca';
import { Titulo } from './Titulo';
import { perfil, redes } from '../dados/perfil';
import { premios } from '../dados/premios';
import { anosDesde, textoContagem } from '../lib/formato';
import { imagem } from '../lib/imagem';
import { useContagensAoVivo } from '../hooks/useContagensAoVivo';
import type { Carga } from '../hooks/useSnapshot';
import type { Rede, Snapshot } from '../lib/tipos';
import './Abertura.css';
import { Botao } from './Botao';
import { Card } from './Card';

const foto = imagem(fotoPicture);
const ordem: Rede[] = ['instagram', 'tiktok', 'youtube', 'github'];

interface Props { carga: Carga<Snapshot>; geradoEm: string }

/** Número de seguidores; quando muda ao vivo, pisca verde e desce um pouco. */
function Legenda({ texto, aviso }: { texto: string; aviso?: string }) {
	const el = useRef<HTMLElement>(null);
	const anterior = useRef(texto);
	const [mudou, setMudou] = useState(false);
	useEffect(() => {
		if (anterior.current === texto || !el.current) return;
		anterior.current = texto;
		setMudou(true);
		animate(el.current, { y: [-4, 0] }, { duration: 0.3 });
		const volta = setTimeout(() => setMudou(false), 1500);
		return () => clearTimeout(volta);
	}, [texto]);
	return <small ref={el} className={mudou ? 'mudou' : undefined} title={aviso}>{texto}</small>;
}

export function Abertura({ carga, geradoEm }: Props) {
	const { contagens, aviso } = useContagensAoVivo(carga);

	// anos de experiência contados no dia do build
	const anos = Math.max(1, anosDesde(perfil.inicioCarreira, new Date(geradoEm)));
	const vitorias = premios.filter((p) => p.colocacao.startsWith('1')).length;
	const numeros = [
		{ valor: anos, sufixo: '+', rotulo: anos === 1 ? 'ano de experiência' : 'anos de experiência' },
		{ valor: perfil.projetosEntregues, sufixo: '+', rotulo: 'projetos entregues' },
		{ valor: vitorias, sufixo: '×', rotulo: '1º lugar em hackathon' },
	];

	/** Sem unidade (GitHub, TikTok) é sempre o @. Com unidade: o número; sem número ou se a API falhou, o @. */
	function legenda(rede: Rede): string | null {
		const info = redes[rede];
		if (!info.unidade) return info.usuario;
		if (!contagens) return carga.estado === 'erro' ? info.usuario : null;
		const c = contagens.find((x) => x.rede === rede);
		return (c && textoContagem(c, info.unidade)) ?? info.usuario;
	}

	return (
		<div className="abertura" id="inicio">
			<div className="retrato" data-retrato="">
				<div className="foto" data-foto="">
					<Img imagem={foto} alt="Henrique Bueno sentado com o notebook cheio de adesivos" sizes="(max-width: 960px) 340px, 460px" loading="eager" fetchPriority="high" />
				</div>
				<Card className="colado java" data-colado=""><span className="ic"><Coffee /></span><span><strong>Java</strong><small>Spring Boot</small></span></Card>
				<Card className="colado aws" data-colado=""><span className="ic"><Cloud /></span><span><strong>AWS</strong><small>cloud</small></span></Card>
				<div className="carimbo" data-carimbo=""><AtSign />{perfil.handle}</div>
			</div>

			<div className="texto">
				<Titulo tag="h1" antes={perfil.nome} />
				<Titulo tag="p" className="papel" destaque={perfil.papel} />
				<p className="bio" data-entra="">Trabalho com <b>Java e AWS</b> e gravo vídeos de 90 segundos explicando <b>sistemas distribuídos</b> com exemplos do Brasil.</p>
				<div className="acoes" data-entra="">
					<Botao variante="primario" href="#projetos">ver projetos <ArrowDown /></Botao>
					<Botao href="#contato">falar comigo <Send /></Botao>
				</div>
				<div className="numeros" data-entra="">
					{numeros.map((n) => (
						<div key={n.rotulo}><strong><span data-conta={n.valor}>{n.valor}</span><em>{n.sufixo}</em></strong><span>{n.rotulo}</span></div>
					))}
				</div>
				<div className="redes" data-entra="">
					{ordem.map((rede) => (
						<Card key={rede} as="a" className="rede" href={redes[rede].url} target="_blank" rel="me noopener noreferrer">
							<span className="ic"><Marca rede={rede} /></span>
							<span>
								<strong>{redes[rede].nome}</strong>
								{legenda(rede) === null
									? <small className="carregando"><span className="esqueleto" aria-hidden="true"></span><span className="so-leitor">carregando seguidores</span></small>
									: <Legenda texto={legenda(rede)!} aviso={redes[rede].unidade ? aviso : undefined} />}
							</span>
						</Card>
					))}
				</div>
				<p className="local" data-entra=""><MapPin />{perfil.local}</p>
			</div>
		</div>
	);
}
