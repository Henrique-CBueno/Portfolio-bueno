package com.henriquebueno.api.snapshot;

import java.io.IOException;
import java.io.UncheckedIOException;
import java.nio.file.Files;
import java.time.Clock;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;

/** Um Estado numa pasta temporária, pros testes de fora deste pacote. */
public final class EstadoTeste {

	private EstadoTeste() {
	}

	public static Estado novo() {
		try {
			var json = new ObjectMapper().findAndRegisterModules().disable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS);
			return new Estado(Files.createTempDirectory("estado"), json, Clock.systemUTC(), e -> {
			});
		} catch (IOException e) {
			throw new UncheckedIOException(e);
		}
	}
}
