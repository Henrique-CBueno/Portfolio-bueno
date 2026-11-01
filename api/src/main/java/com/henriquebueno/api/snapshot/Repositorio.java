package com.henriquebueno.api.snapshot;

import java.time.Instant;
import java.util.List;

/**
 * Repositório do GitHub como o card mostra. {@code linguagens} vêm da maior pra menor; {@code corLinguagem} é a cor
 * que o GitHub dá à primeira (nula se ele não informar); {@code atualizadoEm} é o último push.
 */
public record Repositorio(String nome, String descricao, List<String> linguagens, String url, String corLinguagem, Instant atualizadoEm) {

	public Repositorio {
		linguagens = linguagens == null ? List.of() : List.copyOf(linguagens);
	}
}
