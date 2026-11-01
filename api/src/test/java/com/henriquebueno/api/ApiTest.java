package com.henriquebueno.api;

import static io.restassured.RestAssured.given;
import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.contains;
import static org.hamcrest.Matchers.equalTo;
import static org.hamcrest.Matchers.notNullValue;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.net.HttpURLConnection;
import java.net.URL;
import java.nio.charset.StandardCharsets;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import io.quarkus.mailer.MockMailbox;
import io.quarkus.test.common.http.TestHTTPResource;
import io.quarkus.test.junit.QuarkusTest;
import io.restassured.http.ContentType;
import jakarta.inject.Inject;

/** Sobe a API inteira com as fontes de exemplo e confere o que o site consome. */
@QuarkusTest
class ApiTest {

	private static final String VALIDA = """
			{"nome": "Ana", "email": "ana@exemplo.com", "assunto": "Parceria\\r\\nBcc: x@y.com", "mensagem": "Olá!"}""";

	@Inject
	MockMailbox caixa;

	@TestHTTPResource("/stream")
	URL stream;

	@BeforeEach
	void limpar() {
		caixa.clear();
	}

	@Test
	void snapshotTrazContagensERepositorios() {
		given().get("/snapshot").then()
				.statusCode(200)
				.body("contagens.rede", contains("instagram", "tiktok", "youtube"))
				// a lista vem do GitHub (testado em GitHubTest); aqui só o formato do snapshot
				.body("repositorios", notNullValue());
	}

	@Test
	void capaInexistenteOuIdEstranhoDa404() {
		given().get("/capas/0123456789abcdef").then().statusCode(404);
		given().get("/capas/..%2Fsnapshot").then().statusCode(404);
	}

	@Test
	void streamMandaAsContagensAoConectar() throws Exception {
		var conexao = (HttpURLConnection) stream.openConnection();
		conexao.setReadTimeout(5000);
		try (var leitor = new BufferedReader(new InputStreamReader(conexao.getInputStream(), StandardCharsets.UTF_8))) {
			assertThat(leitor.readLine()).isEqualTo("event:contagens");
			assertThat(leitor.readLine()).startsWith("data:[").contains("\"rede\":\"instagram\"");
		} finally {
			conexao.disconnect();
		}
	}

	@Test
	void contatoEntregaComResponderParaENaoDeixaInjetarCabecalho() {
		given().contentType(ContentType.JSON).body(VALIDA).header("X-Forwarded-For", "10.0.0.1")
				.post("/contato").then().statusCode(202).body("ok", equalTo(true));

		var emails = caixa.getMailsSentTo("contato@henriquebueno.com");
		assertThat(emails).hasSize(1);
		assertThat(emails.getFirst().getSubject()).isEqualTo("[site] Parceria Bcc: x@y.com");
		assertThat(emails.getFirst().getReplyTo()).isEqualTo("ana@exemplo.com");
		assertThat(emails.getFirst().getBcc()).isEmpty();
		assertThat(emails.getFirst().getText()).contains("Ana <ana@exemplo.com>", "Olá!");
	}

	@Test
	void contatoInvalidoDizOQueFalta() {
		given().contentType(ContentType.JSON).body("{\"nome\": \"\", \"email\": \"nao-e-email\", \"mensagem\": \"\"}").header("X-Forwarded-For", "10.0.0.2")
				.post("/contato").then().statusCode(400)
				.body("ok", equalTo(false))
				.body("erros.email", equalTo("e-mail inválido"))
				.body("erros.nome", notNullValue())
				.body("erros.mensagem", notNullValue());
		assertThat(caixa.getTotalMessagesSent()).isZero();
	}

	@Test
	void roboRecebeSucessoMasNadaSai() {
		given().contentType(ContentType.JSON).body("{\"nome\": \"Bot\", \"email\": \"bot@spam.com\", \"mensagem\": \"compre\", \"site\": \"spam.com\"}").header("X-Forwarded-For", "10.0.0.3")
				.post("/contato").then().statusCode(202);
		assertThat(caixa.getTotalMessagesSent()).isZero();
	}

	@Test
	void limitaPorIpDoVisitanteAtrasDoProxy() {
		for (int i = 0; i < 2; i++) given().contentType(ContentType.JSON).body(VALIDA).header("X-Forwarded-For", "10.0.0.4").post("/contato").then().statusCode(202);
		given().contentType(ContentType.JSON).body(VALIDA).header("X-Forwarded-For", "10.0.0.4").post("/contato").then().statusCode(429);
		given().contentType(ContentType.JSON).body(VALIDA).header("X-Forwarded-For", "10.0.0.5").post("/contato").then().statusCode(202);
	}

	@Test
	void corsSoLiberaOSite() {
		given().header("Origin", "http://localhost:4321").header("Access-Control-Request-Method", "POST").options("/contato").then()
				.header("Access-Control-Allow-Origin", "http://localhost:4321");
		given().header("Origin", "https://malicioso.com").header("Access-Control-Request-Method", "POST").options("/contato").then()
				.statusCode(403);
	}

}
