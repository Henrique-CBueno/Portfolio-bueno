package com.henriquebueno.api.capas;

import java.io.InputStream;
import java.util.Optional;
import java.util.regex.Pattern;

/** Onde ficam as capas dos vídeos (MinIO em produção, memória nos testes). */
public interface Capas {

	Pattern ID = Pattern.compile("[a-z0-9-]{1,64}");

	record Arquivo(InputStream conteudo, String tipo, long tamanho) {
	}

	void guardar(String id, byte[] imagem, String tipo);

	Optional<Arquivo> abrir(String id);

	void apagar(String id);
}
