// Título de seção com as palavras subindo como as legendas dos vídeos.
// O trecho em `destaque` fica amarelo (uma palavra amarela por título).
import { Fragment } from 'react';

interface Props { antes?: string; destaque?: string; depois?: string; tag?: 'h1' | 'h2' | 'p'; className?: string; id?: string }

function Palavras({ texto }: { texto: string }) {
	return texto.split(/\s+/).filter(Boolean).map((p, i) => (
		<Fragment key={i}><span className="palavra"><span>{p}</span></span>{' '}</Fragment>
	));
}

export function Titulo({ antes = '', destaque = '', depois = '', tag: Tag = 'h2', className, id }: Props) {
	return (
		<Tag className={className} id={id} data-palavras="" aria-label={[antes, destaque, depois].filter(Boolean).join(' ')}>
			<span aria-hidden="true">
				<Palavras texto={antes} />
				{destaque && <em><Palavras texto={destaque} /></em>}
				<Palavras texto={depois} />
			</span>
		</Tag>
	);
}
