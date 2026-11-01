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

	Instagram instagram();

	Contato contato();

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

	interface Instagram {
		/** Token da Meta (META_API_KEY): do Facebook (via Página) ou do login do Instagram; o tipo é descoberto na primeira leitura. */
		Optional<String> token();

		/** Id da conta do Instagram (com token do Facebook). Vazio: descoberto pela Página ligada (precisa de pages_show_list). */
		Optional<String> conta();

		/** Versão da Graph API nas leituras. */
		String versao();

		String baseInstagram();

		String baseFacebook();

		/** Quantas publicações recentes ler por rodada (só os vídeos viram card). */
		int quantas();

		Duration intervalo();
	}

	interface Contato {
		String para();

		int limite();

		Duration janela();
	}
}
