package com.henriquebueno.api.contato;

import static org.assertj.core.api.Assertions.assertThat;

import java.time.Clock;
import java.time.Duration;
import java.time.Instant;
import java.time.ZoneId;
import java.time.ZoneOffset;

import org.junit.jupiter.api.Test;

class LimiteTest {

	static class Relogio extends Clock {
		Instant agora = Instant.parse("2026-10-22T12:00:00Z");

		@Override
		public ZoneId getZone() {
			return ZoneOffset.UTC;
		}

		@Override
		public Clock withZone(ZoneId zone) {
			return this;
		}

		@Override
		public Instant instant() {
			return agora;
		}
	}

	@Test
	void liberaDeNovoQuandoAJanelaPassa() {
		var relogio = new Relogio();
		var limite = new Limite(2, Duration.ofMinutes(10), relogio);

		assertThat(limite.permitir("1.1.1.1")).isTrue();
		assertThat(limite.permitir("1.1.1.1")).isTrue();
		assertThat(limite.permitir("1.1.1.1")).isFalse();
		assertThat(limite.permitir("2.2.2.2")).as("outro IP tem a própria conta").isTrue();

		relogio.agora = relogio.agora.plus(Duration.ofMinutes(11));
		assertThat(limite.permitir("1.1.1.1")).isTrue();
	}

	@Test
	void cabecalhoDeEmailNaoAceitaQuebraDeLinha() {
		assertThat(Carteiro.umaLinha("Assunto\r\nBcc: alguem@x.com")).isEqualTo("Assunto Bcc: alguem@x.com");
	}
}
