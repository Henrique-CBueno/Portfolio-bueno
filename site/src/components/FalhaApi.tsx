import { RotateCw } from 'lucide-react';
import './FalhaApi.css';

interface Props {
	/** O que não carregou, em uma frase curta ("os números", "o login"). */
	oque: string;
	tentarDeNovo: () => void;
}

/** Quando a API (ou o login) não responde: diz o que houve, sem jargão, e deixa tentar de novo. */
export function FalhaApi({ oque, tentarDeNovo }: Props) {
	return (
		<div className="painel falha-api" role="alert">
			<span className="pill vermelho">fora do ar</span>
			<h2>Não deu pra carregar {oque}</h2>
			<p>O servidor não respondeu agora. Nada se perdeu: os dados continuam salvos. Tente de novo em alguns instantes.</p>
			<button className="botao primario" type="button" onClick={tentarDeNovo}>tentar de novo <RotateCw /></button>
		</div>
	);
}
