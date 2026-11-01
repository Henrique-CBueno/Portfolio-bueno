package com.henriquebueno.api.fontes;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.jboss.logging.Logger;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.henriquebueno.api.PortfolioConfig;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.enterprise.inject.Produces;
import jakarta.inject.Singleton;

/**
 * As fontes automáticas em uso. Sem credencial, a rede fica de fora (YouTube; Instagram, que aí é digitado
 * no painel) ou usa a API pública (GitHub: os repositórios mais recentes em vez dos fixados). O Instagram tem ritmo próprio, por isso fica separado.
 */
public record Conjunto(List<Fontes.DeContagem> contagens, Fontes.DeRepositorios repositorios, Optional<Instagram> instagram) {

	@ApplicationScoped
	static class Montagem {

		private static final Logger log = Logger.getLogger(Conjunto.class);

		// @Singleton e não @ApplicationScoped: um record é final e não pode ganhar proxy
		@Produces
		@Singleton
		Conjunto conjunto(PortfolioConfig config, ObjectMapper json) {
			var contagens = new ArrayList<Fontes.DeContagem>();
			var chaveYouTube = config.youtube().chave().filter(c -> !c.isBlank());
			if (chaveYouTube.isPresent()) {
				contagens.add(new YouTube(new Http(json, config.youtube().base(), Map.of()), chaveYouTube.get(), config.youtube().canal()));
			} else {
				log.warn("YOUTUBE_CHAVE ausente: o site mostra só o @ do YouTube");
			}

			var tokenGitHub = config.github().token().filter(t -> !t.isBlank());
			Fontes.DeRepositorios repositorios;
			if (tokenGitHub.isPresent()) {
				repositorios = new GitHub(new Http(json, config.github().base(), Map.of("Authorization", "Bearer " + tokenGitHub.get())), config.github().usuario(), true);
			} else {
				log.warn("GITHUB_TOKEN ausente: em vez dos fixados, os repositórios públicos mais recentes (API pública, 60 chamadas/hora)");
				repositorios = new GitHub(new Http(json, config.github().base(), Map.of()), config.github().usuario(), false);
			}
			Optional<Instagram> instagram = config.instagram().token().filter(t -> !t.isBlank()).map(t -> {
				var token = new TokenMeta(t, config.dados().resolve("meta-token.json"), json);
				log.info("Instagram lido pela Graph API (META_API_KEY)");
				return new Instagram(new Http(json, config.instagram().baseFacebook(), Map.of()), new Http(json, config.instagram().baseInstagram(), Map.of()),
						token, config.instagram().conta(), config.instagram().versao(), config.instagram().quantas());
			});
			if (instagram.isEmpty()) log.warn("META_API_KEY ausente: seguidores do Instagram digitados no painel e lista de vídeos parada");
			return new Conjunto(List.copyOf(contagens), repositorios, instagram);
		}
	}
}
