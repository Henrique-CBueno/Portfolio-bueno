import type { ImgHTMLAttributes } from 'react';
import type { Imagem } from '../lib/tipos';

type Props = Omit<ImgHTMLAttributes<HTMLImageElement>, 'src' | 'srcSet'> & { imagem: Imagem; [dado: `data-${string}`]: string | undefined };

/** <img> responsivo a partir das larguras geradas no build (lazy por padrão, como o Astro fazia). */
export function Img({ imagem, loading = 'lazy', decoding = 'async', ...resto }: Props) {
	return <img src={imagem.src} srcSet={imagem.srcset} width={imagem.width} height={imagem.height} loading={loading} decoding={decoding} {...resto} />;
}
