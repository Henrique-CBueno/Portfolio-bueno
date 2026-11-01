// Barrinhas + "n / N" embaixo de um carrossel (só aparece no celular).
export function Indicador({ atual, total }: { atual: number; total: number }) {
	return (
		<div className="indicador" aria-hidden="true">
			{Array.from({ length: total }, (_, i) => (
				<i key={i} className={i === atual ? 'ativo' : undefined}></i>
			))}
			<span>
				{atual + 1} / {total}
			</span>
		</div>
	);
}
