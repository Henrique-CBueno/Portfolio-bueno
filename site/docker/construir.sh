#!/bin/sh
# Constrói o site em /site/build-<hora> e aponta /site/atual pra ele (o Nginx serve /site/atual).
# Depois fica de olho em /dados/rebuild-pedido: a API toca esse arquivo quando entra ou sai um Reel.
set -u

SAIDA=/site
PEDIDO=/dados/rebuild-pedido

construir() {
	destino="build-$(date +%Y%m%d-%H%M%S)"
	echo "[construtor] construindo $destino"
	# o build acontece dentro do contêiner (o Astro move arquivos e não atravessa pra outro disco);
	# depois a pasta pronta é copiada pro volume que o Nginx serve
	if rm -rf /app/dist && npx astro build && cp -r /app/dist "$SAIDA/$destino"; then
		ln -sfn "$destino" "$SAIDA/atual"
		for antigo in "$SAIDA"/build-*; do
			[ "$antigo" = "$SAIDA/$destino" ] || rm -rf "$antigo"
		done
		echo "[construtor] no ar: $destino"
	else
		echo "[construtor] build falhou; o site continua na versão anterior"
		rm -rf "${SAIDA:?}/$destino"
	fi
}

marca() { stat -c %Y "$PEDIDO" 2>/dev/null || echo 0; }

construir
ultimo=$(marca)
while sleep 10; do
	agora=$(marca)
	if [ "$agora" != "$ultimo" ]; then
		ultimo=$agora
		construir
	fi
done
