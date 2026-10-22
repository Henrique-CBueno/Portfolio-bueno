package com.henriquebueno.api.fontes;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import org.jboss.logging.Logger;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.henriquebueno.api.PortfolioConfig;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.enterprise.inject.Produces;
import jakarta.inject.Singleton;

/** As fontes automáticas em uso. Sem credencial, a rede fica de fora (YouTube) ou usa a lista copiada (GitHub). */
public record Conjunto(List<Fontes.DeContagem> contagens, Fontes.DeRepositorios repositorios) {

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
				repositorios = new GitHub(new Http(json, config.github().base(), Map.of("Authorization", "Bearer " + tokenGitHub.get())), config.github().usuario());
			} else {
				log.warn("GITHUB_TOKEN ausente: repositórios fixados da lista copiada");
				repositorios = new Exemplo.Repositorios();
			}
			return new Conjunto(List.copyOf(contagens), repositorios);
		}
	}
}
