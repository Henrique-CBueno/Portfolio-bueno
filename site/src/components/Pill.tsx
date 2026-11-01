import type { ReactNode } from 'react';
import type { Cor } from '../lib/tipos';

interface Props { cor?: Cor; href?: string; className?: string; children: ReactNode }

export function Pill({ cor = 'neutro', href, className, children }: Props) {
	const classe = ['pill', cor, className].filter(Boolean).join(' ');
	return href ? <a className={classe} href={href}>{children}</a> : <span className={classe}>{children}</span>;
}
