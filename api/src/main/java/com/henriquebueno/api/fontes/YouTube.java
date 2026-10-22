package com.henriquebueno.api.fontes;

import java.util.List;
import java.util.Map;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.henriquebueno.api.snapshot.Contagem;
import com.henriquebueno.api.snapshot.Rede;

/** YouTube Data API v3. O número de inscritos vem arredondado pela própria API, então é marcado como aproximado. */
public class YouTube implements Fontes.DeContagem {

	@JsonIgnoreProperties(ignoreUnknown = true)
	record Estatisticas(String subscriberCount, boolean hiddenSubscriberCount) {
	}

	@JsonIgnoreProperties(ignoreUnknown = true)
	record Canal(Estatisticas statistics) {
	}

	@JsonIgnoreProperties(ignoreUnknown = true)
	record Resposta(List<Canal> items) {
	}

	private final Http http;
	private final String chave;
	private final String canal;

	public YouTube(Http http, String chave, String canal) {
		this.http = http;
		this.chave = chave;
		this.canal = canal;
	}

	@Override
	public Rede rede() {
		return Rede.YOUTUBE;
	}

	@Override
	public Contagem ler() {
		// "@bueno_dev" é um handle; "UC..." é o id do canal
		var parametro = canal.startsWith("@") ? "forHandle" : "id";
		var resposta = http.get("/channels", Map.of("part", "statistics", parametro, canal, "key", chave), Resposta.class);
		if (resposta.items() == null || resposta.items().isEmpty()) throw new IllegalStateException("Canal do YouTube não encontrado: " + canal);
		var estatisticas = resposta.items().getFirst().statistics();
		if (estatisticas.hiddenSubscriberCount()) return Contagem.semValor(Rede.YOUTUBE);
		return Contagem.automatica(Rede.YOUTUBE, Long.parseLong(estatisticas.subscriberCount()), true);
	}
}
