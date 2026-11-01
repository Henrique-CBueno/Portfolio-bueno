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
import type { Contagem, Rede } from '../lib/tipos';
import './Abertura.css';

const foto = imagem(fotoPicture);
const ordem: Rede[] = ['instagram', 'tiktok', 'youtube', 'github'];

interface Props { contagens: Contagem[]; lidoEm: string; geradoEm: string }

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

export function Abertura({ contagens: doBuild, lidoEm, geradoEm }: Props) {
	const [contagens, aviso] = useContagensAoVivo(doBuild, lidoEm);

	// anos de experiência contados no dia do build
	const anos = Math.max(1, anosDesde(perfil.inicioCarreira, new Date(geradoEm)));
	const vitorias = premios.filter((p) => p.colocacao.startsWith('1')).length;
	const numeros = [
		{ valor: anos, sufixo: '+', rotulo: anos === 1 ? 'ano de experiência' : 'anos de experiência' },
		{ valor: perfil.projetosEntregues, sufixo: '+', rotulo: 'projetos entregues' },
		{ valor: vitorias, sufixo: '×', rotulo: '1º lugar em hackathon' },
	];

	function legenda(rede: Rede) {
		const c = contagens.find((x) => x.rede === rede);
		const info = redes[rede];
		if (!c || !info.unidade) return info.usuario;
		return textoContagem(c, info.unidade) ?? info.usuario;
	}

	return (
		<div className="abertura" id="inicio">
			<div className="retrato" data-retrato="">
				<div className="foto" data-foto="">
					<Img imagem={foto} alt="Henrique Bueno sentado com o notebook cheio de adesivos" sizes="(max-width: 960px) 340px, 460px" loading="eager" fetchPriority="high" />
				</div>
				<div className="painel colado java" data-colado=""><span className="ic"><Coffee /></span><span><strong>Java</strong><small>Spring Boot</small></span></div>
				<div className="painel colado aws" data-colado=""><span className="ic"><Cloud /></span><span><strong>AWS</strong><small>cloud</small></span></div>
				<div className="carimbo" data-carimbo=""><AtSign />{perfil.handle}</div>
			</div>

			<div className="texto">
				<Titulo tag="h1" antes={perfil.nome} />
				<Titulo tag="p" className="papel" destaque={perfil.papel} />
				<p className="bio" data-entra="">Trabalho com <b>Java e AWS</b> e gravo vídeos de 90 segundos explicando <b>sistemas distribuídos</b> com exemplos do Brasil.</p>
				<div className="acoes" data-entra="">
					<a className="botao primario" href="#projetos">ver projetos <ArrowDown /></a>
					<a className="botao" href="#contato">falar comigo <Send /></a>
				</div>
				<div className="numeros" data-entra="">
					{numeros.map((n) => (
						<div key={n.rotulo}><strong><span data-conta={n.valor}>{n.valor}</span><em>{n.sufixo}</em></strong><span>{n.rotulo}</span></div>
					))}
				</div>
				<div className="redes" data-entra="">
					{ordem.map((rede) => (
						<a key={rede} className="painel rede" href={redes[rede].url} target="_blank" rel="me noopener noreferrer">
							<span className="ic"><Marca rede={rede} /></span>
							<span><strong>{redes[rede].nome}</strong><Legenda texto={legenda(rede)} aviso={redes[rede].unidade ? aviso : undefined} /></span>
						</a>
					))}
				</div>
				<p className="local" data-entra=""><MapPin />{perfil.local}</p>
			</div>
		</div>
	);
}
