package com.henriquebueno.api.fontes;

import static org.assertj.core.api.Assertions.assertThat;

import java.util.List;
import java.util.Map;

import org.junit.jupiter.api.Test;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.henriquebueno.api.snapshot.Repositorio;

class GitHubTest {

	@Test
	void usaDescricaoOuPrimeiroParagrafoDoReadme() throws Exception {
		try (var servidor = new Servidor()) {
			servidor.responder("/graphql", """
					{"data": {"user": {"pinnedItems": {"nodes": [
					  {"name": "com-descricao", "url": "https://github.com/u/a", "description": "Descrição do repo.", "languages": {"nodes": [{"name": "Java"}]}, "readme": null},
					  {"name": "so-readme", "url": "https://github.com/u/b", "description": null, "languages": {"nodes": [{"name": "Java"}, {"name": "Dockerfile"}]},
					   "readme": {"text": "# Título\\n\\n[![build](https://x/y.svg)](https://x)\\n\\nSistema de **pedidos** com [Kafka](https://kafka.apache.org).\\nSegunda linha.\\n\\nOutro parágrafo."}},
					  {"name": "sem-nada", "url": "https://github.com/u/c", "description": "", "languages": {"nodes": []}, "readme": null}
					]}}}}""");
			var http = new Http(new ObjectMapper(), servidor.base(), Map.of("Authorization", "Bearer tk"));

			var repos = new GitHub(http, "u").fixados();

			assertThat(repos).containsExactly(
					new Repositorio("com-descricao", "Descrição do repo.", List.of("Java"), "https://github.com/u/a"),
					new Repositorio("so-readme", "Sistema de pedidos com Kafka. Segunda linha.", List.of("Java", "Dockerfile"), "https://github.com/u/b"),
					new Repositorio("sem-nada", null, List.of(), "https://github.com/u/c"));
			var pedido = servidor.pedidos.getFirst();
			assertThat(pedido.metodo()).isEqualTo("POST");
			assertThat(pedido.cabecalhos().get("Authorization")).containsExactly("Bearer tk");
			assertThat(pedido.corpo()).contains("pinnedItems", "\"login\":\"u\"");
		}
	}

	@Test
	void readmeSoComTitulosECodigoNaoTemParagrafo() {
		assertThat(GitHub.primeiroParagrafo("# Título\n\n```\nmvn install\n```\n\n- item")).isNull();
	}

	@Test
	void paragrafoLongoECortadoNoFimDeUmaPalavra() {
		var texto = GitHub.primeiroParagrafo("palavra ".repeat(60));
		assertThat(texto).hasSizeLessThanOrEqualTo(281).endsWith("palavra…");
	}
}
