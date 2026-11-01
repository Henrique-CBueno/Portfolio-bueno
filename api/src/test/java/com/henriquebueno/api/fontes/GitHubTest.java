package com.henriquebueno.api.fontes;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import java.time.Clock;
import java.time.Instant;
import java.time.ZoneId;
import java.time.ZoneOffset;
import java.util.List;
import java.util.concurrent.atomic.AtomicReference;
import java.util.Map;

import org.junit.jupiter.api.Test;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.henriquebueno.api.snapshot.Repositorio;

class GitHubTest {

	static final ObjectMapper JSON = new ObjectMapper().findAndRegisterModules();

	@Test
	void semTokenUsaOsPublicosMaisRecentesSemForkNemArquivado() throws Exception {
		try (var servidor = new Servidor()) {
			servidor.responder("/users/u/repos", """
					[
					  {"name": "novo", "html_url": "https://github.com/u/novo", "description": " Algo novo. ", "language": "Java", "pushed_at": "2026-10-31T10:00:00Z", "fork": false, "archived": false},
					  {"name": "copia", "html_url": "https://github.com/u/copia", "description": null, "language": "Go", "pushed_at": "2026-10-30T10:00:00Z", "fork": true, "archived": false},
					  {"name": "velho", "html_url": "https://github.com/u/velho", "description": "", "language": null, "pushed_at": "2026-01-01T10:00:00Z", "fork": false, "archived": true},
					  {"name": "sem-desc", "html_url": "https://github.com/u/sem-desc", "description": "", "language": null, "pushed_at": "2026-09-01T10:00:00Z", "fork": false, "archived": false}
					]""");
			var repos = new GitHub(new Http(JSON, servidor.base(), Map.of()), "u", false).fixados();

			assertThat(repos).containsExactly(
					new Repositorio("novo", "Algo novo.", List.of("Java"), "https://github.com/u/novo", null, Instant.parse("2026-10-31T10:00:00Z")),
					new Repositorio("sem-desc", null, List.of(), "https://github.com/u/sem-desc", null, Instant.parse("2026-09-01T10:00:00Z")));
			var pedido = servidor.pedidos.getFirst();
			assertThat(pedido.cabecalhos()).doesNotContainKey("Authorization");
			assertThat(pedido.uri().getQuery()).contains("sort=pushed");
		}
	}

	@Test
	void publicosTrazTodosOsReposProprios() throws Exception {
		try (var servidor = new Servidor()) {
			var muitos = new StringBuilder("[");
			for (int i = 0; i < 9; i++) muitos.append(i == 0 ? "" : ",").append("{\"name\": \"r").append(i).append("\", \"html_url\": \"https://github.com/u/r").append(i).append("\", \"fork\": false, \"archived\": false}");
			muitos.append(",{\"name\": \"copia\", \"html_url\": \"https://github.com/u/copia\", \"fork\": true, \"archived\": false}]");
			servidor.responder("/users/u/repos", muitos.toString());
			var github = new GitHub(new Http(JSON, servidor.base(), Map.of("Authorization", "Bearer tk")), "u", true);

			assertThat(github.publicos()).hasSize(9).extracting(Repositorio::nome).doesNotContain("copia");
			assertThat(servidor.pedidos.getFirst().uri().getQuery()).contains("per_page=100");
		}
	}

	@Test
	void limiteDoGitHubPausaAsChamadasAteOHorarioQueEleInformou() throws Exception {
		try (var servidor = new Servidor()) {
			var reset = Instant.parse("2026-11-01T13:00:00Z");
			servidor.responder("/users/u/repos", 403, "{\"message\": \"API rate limit exceeded\"}",
					Map.of("x-ratelimit-remaining", "0", "x-ratelimit-reset", String.valueOf(reset.getEpochSecond())));
			var agora = new AtomicReference<>(Instant.parse("2026-11-01T12:00:00Z"));
			var relogio = new Clock() {
				@Override public ZoneId getZone() { return ZoneOffset.UTC; }
				@Override public Clock withZone(ZoneId zona) { return this; }
				@Override public Instant instant() { return agora.get(); }
			};
			var github = new GitHub(new Http(JSON, servidor.base(), Map.of()), "u", false, relogio);

			assertThatThrownBy(github::fixados).isInstanceOf(Http.LimiteAtingido.class);
			// antes do reset: nem chama o GitHub
			agora.set(Instant.parse("2026-11-01T12:30:00Z"));
			assertThatThrownBy(github::fixados).hasMessageContaining("limite de requisições do GitHub");
			assertThat(servidor.pedidos).hasSize(1);
			// depois do reset: volta a chamar
			servidor.responder("/users/u/repos", 200, "[]", Map.of());
			agora.set(Instant.parse("2026-11-01T13:00:01Z"));
			assertThat(github.fixados()).isEmpty();
			assertThat(servidor.pedidos).hasSize(2);
		}
	}

	@Test
	void retryAfterTambemContaComoLimite() throws Exception {
		try (var servidor = new Servidor()) {
			servidor.responder("/graphql", 429, "{}", Map.of("retry-after", "120"));
			var antes = Instant.now();
			assertThatThrownBy(() -> new GitHub(new Http(JSON, servidor.base(), Map.of()), "u", true).fixados())
					.isInstanceOfSatisfying(Http.LimiteAtingido.class, e -> assertThat(e.ate).isBetween(antes.plusSeconds(119), antes.plusSeconds(125)));
		}
	}

	@Test
	void usaDescricaoOuPrimeiroParagrafoDoReadme() throws Exception {
		try (var servidor = new Servidor()) {
			servidor.responder("/graphql", """
					{"data": {"user": {"pinnedItems": {"nodes": [
					  {"name": "com-descricao", "url": "https://github.com/u/a", "description": "Descrição do repo.", "pushedAt": "2026-10-30T12:00:00Z", "languages": {"nodes": [{"name": "Java", "color": "#b07219"}]}, "readme": null},
					  {"name": "so-readme", "url": "https://github.com/u/b", "description": null, "languages": {"nodes": [{"name": "Java"}, {"name": "Dockerfile"}]},
					   "readme": {"text": "# Título\\n\\n[![build](https://x/y.svg)](https://x)\\n\\nSistema de **pedidos** com [Kafka](https://kafka.apache.org).\\nSegunda linha.\\n\\nOutro parágrafo."}},
					  {"name": "sem-nada", "url": "https://github.com/u/c", "description": "", "languages": {"nodes": []}, "readme": null}
					]}}}}""");
			var http = new Http(JSON, servidor.base(), Map.of("Authorization", "Bearer tk"));

			var repos = new GitHub(http, "u", true).fixados();

			assertThat(repos).containsExactly(
					new Repositorio("com-descricao", "Descrição do repo.", List.of("Java"), "https://github.com/u/a", "#b07219", Instant.parse("2026-10-30T12:00:00Z")),
					new Repositorio("so-readme", "Sistema de pedidos com Kafka. Segunda linha.", List.of("Java", "Dockerfile"), "https://github.com/u/b", null, null),
					new Repositorio("sem-nada", null, List.of(), "https://github.com/u/c", null, null));
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
