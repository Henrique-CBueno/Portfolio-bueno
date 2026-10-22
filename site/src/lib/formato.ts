const numero = new Intl.NumberFormat('pt-BR');
const relativo = new Intl.RelativeTimeFormat('pt-BR', { numeric: 'auto' });

export function formatarNumero(valor: number): string {
	return numero.format(valor);
}

const passos: [Intl.RelativeTimeFormatUnit, number][] = [
	['year', 365 * 86400],
	['month', 30 * 86400],
	['week', 7 * 86400],
	['day', 86400],
	['hour', 3600],
	['minute', 60],
];

/** "há 2 dias", "há 1 semana"… Também roda no navegador pra não envelhecer entre um build e outro. */
export function tempoRelativo(data: Date, agora = new Date()): string {
	const segundos = (data.getTime() - agora.getTime()) / 1000;
	for (const [unidade, tamanho] of passos) {
		if (Math.abs(segundos) >= tamanho) return relativo.format(Math.round(segundos / tamanho), unidade);
	}
	return 'agora';
}

/** "1.284 seguidores", com "~" quando o número é aproximado (YouTube). */
export function textoContagem(c: { valor: number | null; aproximado?: boolean }, unidade: string): string | null {
	if (c.valor === null) return null;
	return `${c.aproximado ? '~' : ''}${formatarNumero(c.valor)} ${unidade}`;
}

/** Anos completos desde uma data "AAAA-MM". */
export function anosDesde(inicio: string, agora = new Date()): number {
	const [ano, mes] = inicio.split('-').map(Number);
	const meses = (agora.getFullYear() - ano) * 12 + (agora.getMonth() + 1 - mes);
	return Math.max(0, Math.floor(meses / 12));
}
