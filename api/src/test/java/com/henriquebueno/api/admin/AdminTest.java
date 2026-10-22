package com.henriquebueno.api.admin;

import static io.restassured.RestAssured.given;
import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.equalTo;
import static org.hamcrest.Matchers.hasItem;
import static org.hamcrest.Matchers.not;
import static org.hamcrest.Matchers.notNullValue;
import static org.hamcrest.Matchers.nullValue;

import org.junit.jupiter.api.Test;

import com.henriquebueno.api.capas.CapasEmMemoria;

import io.quarkus.test.junit.QuarkusTest;
import io.quarkus.test.security.TestSecurity;
import io.restassured.http.ContentType;
import io.restassured.specification.RequestSpecification;
import jakarta.inject.Inject;

@QuarkusTest
class AdminTest {

	/** Os primeiros bytes de um JPEG bastam pra validação. */
	static final byte[] JPEG = { (byte) 0xFF, (byte) 0xD8, (byte) 0xFF, (byte) 0xE0, 0, 0x10, 'J', 'F', 'I', 'F', 0, 1 };

	@Inject
	CapasEmMemoria capas;

	@Test
	void semLoginNaoEntra() {
		given().get("/admin-api/videos").then().statusCode(401);
	}

	@Test
	@TestSecurity(user = "visitante", roles = "leitor")
	void semOPapelAdminNaoEntra() {
		given().get("/admin-api/videos").then().statusCode(403);
	}

	@Test
	@TestSecurity(user = "henrique", roles = "admin")
	void cadastraEditaEApagaUmVideo() {
		String id = novo("Circuit breaker na prática", "resiliencia", "2026-10-20")
				.multiPart("instagram", "https://www.instagram.com/reel/abc123/")
				.multiPart("tiktok", "https://www.tiktok.com/@bueno_dev0/video/1")
				.multiPart("capa", "capa.jpg", JPEG, "image/jpeg")
				.post("/admin-api/videos").then()
				.statusCode(201)
				.body("link", equalTo("https://www.instagram.com/reel/abc123/"))
				.body("links.tiktok", equalTo("https://www.tiktok.com/@bueno_dev0/video/1"))
				.body("categoria", equalTo("resiliencia"))
				.extract().path("id");
		String capa = given().get("/snapshot").then().body("videos.id", hasItem(id)).extract().path("videos.find { it.id == '" + id + "' }.capa");
		given().get(capa).then().statusCode(200).contentType("image/jpeg").header("Cache-Control", "public, max-age=31536000, immutable");

		// troca a capa e tira o Instagram: o card passa a levar pro TikTok
		given().multiPart("titulo", "Circuit breaker, de novo").multiPart("categoria", "").multiPart("publicadoEm", "2026-10-21")
				.multiPart("tiktok", "https://www.tiktok.com/@bueno_dev0/video/1")
				.multiPart("capa", "nova.jpg", JPEG, "image/jpeg")
				.put("/admin-api/videos/" + id).then()
				.statusCode(200)
				.body("link", equalTo("https://www.tiktok.com/@bueno_dev0/video/1"))
				.body("categoria", nullValue())
				.body("capa", not(equalTo(capa)));
		assertThat(capas.tem(capa.substring("/capas/".length()))).as("a capa antiga sai do MinIO").isFalse();

		given().delete("/admin-api/videos/" + id).then().statusCode(204);
		given().get("/snapshot").then().body("videos.id", not(hasItem(id)));
		given().delete("/admin-api/videos/" + id).then().statusCode(404);
	}

	@Test
	@TestSecurity(user = "henrique", roles = "admin")
	void recusaDadosRuinsDizendoOQueCorrigir() {
		given().multiPart("titulo", "").multiPart("categoria", "inventada").multiPart("publicadoEm", "ontem")
				.multiPart("instagram", "http://site-qualquer.com/x")
				.multiPart("capa", "capa.txt", "não sou imagem".getBytes(), "image/jpeg")
				.post("/admin-api/videos").then()
				.statusCode(400)
				.body("erros.titulo", equalTo("falta o título"))
				.body("erros.categoria", equalTo("categoria desconhecida"))
				.body("erros.publicadoEm", notNullValue())
				.body("erros.instagram", notNullValue())
				.body("erros.capa", equalTo("a capa precisa ser JPEG, PNG ou WebP"));

		novo("Sem link nenhum", "", "2026-10-20").multiPart("capa", "capa.jpg", JPEG, "image/jpeg")
				.post("/admin-api/videos").then().statusCode(400).body("erros.links", notNullValue());
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
		given().contentType(ContentType.JSON).body("{\"valor\": -1}").put("/admin-api/contagens/tiktok").then().statusCode(400);
	}

	private static RequestSpecification novo(String titulo, String categoria, String data) {
		return given().multiPart("titulo", titulo).multiPart("categoria", categoria).multiPart("publicadoEm", data);
	}
}
