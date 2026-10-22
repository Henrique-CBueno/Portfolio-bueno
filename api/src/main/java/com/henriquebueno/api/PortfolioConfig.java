package com.henriquebueno.api;

import java.nio.file.Path;
import java.time.Duration;
import java.util.List;
import java.util.Optional;

import io.smallrye.config.ConfigMapping;

/** Tudo que muda entre máquinas fica aqui; segredos vêm de variáveis de ambiente (ver application.properties). */
@ConfigMapping(prefix = "portfolio")
public interface PortfolioConfig {

	Path dados();

	List<String> categorias();

	Minio minio();

	YouTube youtube();

	GitHub github();

	Contato contato();

	Rebuild rebuild();

	interface Minio {
		String url();

		String usuario();

		String senha();

		String bucket();
	}

	interface YouTube {
		Optional<String> chave();

		String canal();

		String base();

		Duration intervalo();
	}

	interface GitHub {
		Optional<String> token();

		String usuario();

		String base();

		Duration intervalo();
	}

	interface Contato {
		String para();

		int limite();

		Duration janela();
	}

	interface Rebuild {
		Optional<String> comando();
	}
}
