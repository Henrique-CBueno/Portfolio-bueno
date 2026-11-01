import type { Imagem } from './tipos';

/** Saída `&as=picture` do vite-imagetools (só WebP) → Imagem. */
export function imagem(p: { sources: Record<string, string>; img: { src: string; w: number; h: number } }): Imagem {
	return { src: p.img.src, srcset: p.sources.webp, width: p.img.w, height: p.img.h };
}
