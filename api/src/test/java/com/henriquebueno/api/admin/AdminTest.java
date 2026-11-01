package com.henriquebueno.api.admin;

import static io.restassured.RestAssured.given;
import static org.hamcrest.Matchers.equalTo;
import static org.hamcrest.Matchers.hasItem;
import static org.hamcrest.Matchers.not;
import static org.hamcrest.Matchers.notNullValue;
import static org.hamcrest.Matchers.nullValue;

import org.junit.jupiter.api.Test;

import io.quarkus.test.junit.QuarkusTest;
import io.quarkus.test.security.TestSecurity;
import io.restassured.http.ContentType;

@QuarkusTest
class AdminTest {

	@Test
	void semLoginNaoEntra() {
		given().get("/admin-api/contagens").then().statusCode(401);
	}

	@Test
	@TestSecurity(user = "visitante", roles = "leitor")
	void semOPapelAdminNaoEntra() {
		given().get("/admin-api/contagens").then().statusCode(403);
	}

	@Test
	@TestSecurity(user = "henrique", roles = "admin")
	void mensagemDoFormularioApareceNoPainelEPodeSerLidaEApagada() {
		given().contentType(ContentType.JSON).header("X-Forwarded-For", "10.9.0.1")
				.body("{\"nome\": \"Bia\", \"email\": \"bia@empresa.com\", \"assunto\": \"Vaga\", \"mensagem\": \"Vi seus vídeos e queria conversar sobre uma vaga.\"}")
				.post("/contato").then().statusCode(202);

		String id = given().get("/admin-api/mensagens").then().statusCode(200)
				.body("[0].nome", equalTo("Bia"))
				.body("[0].email", equalTo("bia@empresa.com"))
				.body("[0].assunto", equalTo("Vaga"))
				.body("[0].lida", equalTo(false))
				.body("[0].recebidaEm", notNullValue())
				.extract().path("[0].id");

		given().contentType(ContentType.JSON).body("{\"lida\": true}").put("/admin-api/mensagens/" + id + "/lida").then()
				.statusCode(200).body("lida", equalTo(true));
		given().delete("/admin-api/mensagens/" + id).then().statusCode(204);
		given().get("/admin-api/mensagens").then().body("id", not(hasItem(id)));
		given().delete("/admin-api/mensagens/" + id).then().statusCode(404);
	}

	@Test
	void semLoginNaoVeAsMensagens() {
		given().get("/admin-api/mensagens").then().statusCode(401);
	}

	@Test
	@TestSecurity(user = "henrique", roles = "admin")
	void videosNaoSaoMaisCadastradosNoPainel() {
		given().get("/admin-api/videos").then().statusCode(404);
	}

	@Test
	@TestSecurity(user = "henrique", roles = "admin")
	void semTokenDaMetaOInstagramEDigitadoNoPainelEOTikTokNemAparece() {
		// nos testes não há META_API_KEY
		given().get("/admin-api/contagens").then()
				.body("find { it.rede == 'instagram' }.editavel", equalTo(true))
				.body("find { it.rede == 'tiktok' }", nullValue())
				.body("find { it.rede == 'youtube' }.editavel", equalTo(false));
	}

	@Test
	@TestSecurity(user = "henrique", roles = "admin")
	void numerosDigitadosNoPainelVaoProSnapshotComData() {
		given().contentType(ContentType.JSON).body("{\"valor\": 1290}").put("/admin-api/contagens/instagram").then()
				.statusCode(200).body("manual", equalTo(true)).body("atualizadoEm", notNullValue());
		given().get("/snapshot").then()
				.body("contagens.find { it.rede == 'instagram' }.valor", equalTo(1290))
				.body("contagens.find { it.rede == 'instagram' }.manual", equalTo(true));

		given().contentType(ContentType.JSON).body("{\"valor\": null}").put("/admin-api/contagens/instagram").then().statusCode(200);
		given().get("/snapshot").then().body("contagens.find { it.rede == 'instagram' }.valor", nullValue());

		given().contentType(ContentType.JSON).body("{\"valor\": 5}").put("/admin-api/contagens/youtube").then().statusCode(400);
		given().contentType(ContentType.JSON).body("{\"valor\": -1}").put("/admin-api/contagens/instagram").then().statusCode(400);
		// o TikTok mostra só o @: nem dá pra digitar o número
		given().contentType(ContentType.JSON).body("{\"valor\": 90}").put("/admin-api/contagens/tiktok").then().statusCode(400);
		given().get("/snapshot").then().body("contagens.find { it.rede == 'tiktok' }.valor", nullValue());
	}
}
