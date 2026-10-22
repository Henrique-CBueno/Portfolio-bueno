package com.henriquebueno.api.contato;

import java.time.Clock;
import java.time.Duration;
import java.time.Instant;
import java.util.ArrayDeque;
import java.util.Deque;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

import com.henriquebueno.api.PortfolioConfig;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;

/** No máximo {@code limite} mensagens por IP dentro da janela (padrão: 3 a cada 10 min). */
@ApplicationScoped
class Limite {

	private final int limite;
	private final Duration janela;
	private final Clock relogio;
	private final Map<String, Deque<Instant>> envios = new ConcurrentHashMap<>();

	@Inject
	Limite(PortfolioConfig config) {
		this(config.contato().limite(), config.contato().janela(), Clock.systemUTC());
	}

	Limite(int limite, Duration janela, Clock relogio) {
		this.limite = limite;
		this.janela = janela;
		this.relogio = relogio;
	}

	boolean permitir(String ip) {
		var agora = relogio.instant();
		var corte = agora.minus(janela);
		var permitido = new boolean[1];
		envios.compute(ip, (chave, fila) -> {
			var f = fila == null ? new ArrayDeque<Instant>() : fila;
			while (!f.isEmpty() && f.peekFirst().isBefore(corte)) f.pollFirst();
			permitido[0] = f.size() < limite;
			if (permitido[0]) f.addLast(agora);
			return f.isEmpty() ? null : f;
		});
		return permitido[0];
	}
}
