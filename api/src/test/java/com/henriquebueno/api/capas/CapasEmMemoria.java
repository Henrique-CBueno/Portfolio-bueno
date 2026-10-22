package com.henriquebueno.api.capas;

import java.io.ByteArrayInputStream;
import java.util.Map;
import java.util.Optional;
import java.util.concurrent.ConcurrentHashMap;

import io.quarkus.test.Mock;
import jakarta.enterprise.context.ApplicationScoped;

/** Substitui o MinIO nos testes. */
@Mock
@ApplicationScoped
public class CapasEmMemoria implements Capas {

	record Guardada(byte[] bytes, String tipo) {
	}

	final Map<String, Guardada> guardadas = new ConcurrentHashMap<>();

	@Override
	public void guardar(String id, byte[] imagem, String tipo) {
		guardadas.put(id, new Guardada(imagem, tipo));
	}

	@Override
	public Optional<Arquivo> abrir(String id) {
		return Optional.ofNullable(guardadas.get(id)).map(g -> new Arquivo(new ByteArrayInputStream(g.bytes()), g.tipo(), g.bytes().length));
	}

	@Override
	public void apagar(String id) {
		guardadas.remove(id);
	}

	public boolean tem(String id) {
		return guardadas.containsKey(id);
	}
}
