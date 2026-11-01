// Arquitetura desenhada no lugar do print, como as cenas dos vídeos.
// Os pacotes (data-pacote) correm pelos fios enquanto o diagrama está na tela.
import { Fragment } from 'react';
import type { Cor } from '../lib/tipos';
import './Diagrama.css';

interface No { nome: string; cor?: Cor }
interface Props { nos: No[]; saidas: No[]; descricao: string }

export function Diagrama({ nos, saidas, descricao }: Props) {
	return (
		<div className="fluxo" role="img" aria-label={descricao} data-diagrama="">
			{nos.map((n) => (
				<Fragment key={n.nome}>
					<span className={['no', n.cor].filter(Boolean).join(' ')} data-no="">{n.nome}</span>
					<span className="fio" data-fio-h=""><i data-pacote=""></i></span>
				</Fragment>
			))}
			<span className="saidas">
				{saidas.map((n) => <span key={n.nome} className={['no', n.cor].filter(Boolean).join(' ')} data-no="">{n.nome}</span>)}
			</span>
		</div>
	);
}
