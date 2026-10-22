package com.henriquebueno.api.snapshot;

import java.time.Instant;

/**
 * Seguidores ou inscritos. {@code valor} nulo = sem número (o site mostra só o @).
 * {@code manual} = digitado no painel; aí {@code atualizadoEm} diz quando, pro site mostrar.
 */
public record Contagem(Rede rede, Long valor, boolean aproximado, boolean manual, Instant atualizadoEm) {

	public static Contagem semValor(Rede rede) {
		return new Contagem(rede, null, false, false, null);
	}

	public static Contagem automatica(Rede rede, long valor, boolean aproximado) {
		return new Contagem(rede, valor, aproximado, false, null);
	}

	public static Contagem manual(Rede rede, Long valor, Instant quando) {
		return new Contagem(rede, valor, false, true, valor == null ? null : quando);
	}
}
