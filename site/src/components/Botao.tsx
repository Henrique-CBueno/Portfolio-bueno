import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from 'react';
import { Link, type LinkProps } from 'react-router';

/**
 * O botão do site, igual em todas as páginas (estilo .botao no global.css). Vira link de rota (`to`),
 * link comum (`href`) ou <button>, conforme o que recebe.
 */
export type VarianteBotao = 'primario' | 'perigo';

interface Comum {
	/** primario: amarelo, a ação principal da tela; perigo: borda vermelha (ex.: confirmar apagar). */
	variante?: VarianteBotao;
	className?: string;
	children: ReactNode;
}

type ComoRota = Comum & Omit<LinkProps, 'className'>;
type ComoLink = Comum & Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'className'> & { href: string };
type ComoBotao = Comum & Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'className'>;

export function classeDoBotao(variante?: VarianteBotao, className?: string) {
	return ['botao', variante, className].filter(Boolean).join(' ');
}

export function Botao(props: ComoRota | ComoLink | ComoBotao) {
	if ('to' in props) {
		const { variante, className, ...resto } = props;
		return <Link className={classeDoBotao(variante, className)} {...resto} />;
	}
	if ('href' in props && props.href !== undefined) {
		const { variante, className, ...resto } = props as ComoLink;
		return <a className={classeDoBotao(variante, className)} {...resto} />;
	}
	const { variante, className, type = 'button', ...resto } = props as ComoBotao;
	return <button type={type} className={classeDoBotao(variante, className)} {...resto} />;
}
