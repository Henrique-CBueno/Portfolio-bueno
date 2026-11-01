import type { ComponentPropsWithoutRef, ElementType } from 'react';

/**
 * O card do site, igual em todas as páginas (estilo .painel no global.css: fundo de painel, borda de fio,
 * cantos de 14px). `as` troca o elemento (article, form, li, Link…) sem trocar o visual.
 */
type Props<T extends ElementType> = { as?: T; className?: string } & Omit<ComponentPropsWithoutRef<T>, 'as' | 'className'>;

export function Card<T extends ElementType = 'div'>({ as, className, ...resto }: Props<T>) {
	const Elemento: ElementType = as ?? 'div';
	return <Elemento className={className ? `painel ${className}` : 'painel'} {...resto} />;
}
