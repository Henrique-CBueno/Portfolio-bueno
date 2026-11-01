package com.henriquebueno.api.fontes;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import java.nio.file.Files;
import java.nio.file.Path;
import java.time.Instant;
import java.util.Map;
import java.util.Optional;

import org.junit.jupiter.api.Test;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.henriquebueno.api.snapshot.Contagem;
import com.henriquebueno.api.snapshot.Rede;

class InstagramTest {

	final ObjectMapper json = new ObjectMapper();

	static final String MIDIAS = """
			{"data": [
			  {"id": "2", "caption": "Reel novo #resiliencia", "media_type": "VIDEO", "media_product_type": "REELS", "permalink": "https://www.instagram.com/reel/B/", "thumbnail_url": "https://cdn/b.jpg", "timestamp": "2026-10-20T21:00:00+0000"},
			  {"id": "1", "caption": "Uma foto", "media_type": "IMAGE", "permalink": "https://www.instagram.com/p/A/", "media_url": "https://cdn/a.jpg", "timestamp": "2026-10-19T21:00:00+0000"}
			]}""";

	Path arquivo() throws Exception {
		return Files.createTempDirectory("meta").resolve("meta-token.json");
	}

	Instagram instagram(Servidor facebook, Servidor ig, TokenMeta token) {
		return instagram(facebook, ig, token, Optional.empty());
	}

	Instagram instagram(Servidor facebook, Servidor ig, TokenMeta token, Optional<String> conta) {
		return new Instagram(new Http(json, facebook.base(), Map.of()), new Http(json, ig.base(), Map.of()), token, conta, "v23.0", 20);
	}

	@Test
	void tokenQueOFacebookRecusaELidoPeloInstagram() throws Exception {
		try (var facebook = new Servidor(); var ig = new Servidor()) {
			ig.responder("/v23.0/me", "{\"id\": \"9\", \"followers_count\": 1284}").responder("/v23.0/me/media", MIDIAS);
			var instagram = instagram(facebook, ig, new TokenMeta("IGtoken", arquivo(), json));

			assertThat(instagram.ler()).isEqualTo(Contagem.automatica(Rede.INSTAGRAM, 1284, false));
			assertThat(instagram.recentes()).containsExactly(new Fontes.Publicacao("2", "Reel novo #resiliencia", "https://www.instagram.com/reel/B/", "https://cdn/b.jpg", Instant.parse("2026-10-20T21:00:00Z")));
			assertThat(instagram.doFacebook()).isFalse();
			assertThat(ig.pedidos).allSatisfy(p -> assertThat(p.uri().getQuery()).contains("access_token=IGtoken"));
		}
	}

	@Test
	void tokenDoFacebookAchaAContaLigadaAPagina() throws Exception {
		try (var facebook = new Servidor(); var ig = new Servidor()) {
			// token de usuário (não começa com EAA de propósito: o tipo vem da resposta, não do texto)
			facebook.responder("/v23.0/me", "{\"id\": \"u1\"}")
					.responder("/v23.0/me/accounts", "{\"data\": [{\"id\": \"pg\"}, {\"id\": \"pg2\", \"instagram_business_account\": {\"id\": \"178\"}}]}")
					.responder("/v23.0/178", "{\"followers_count\": 90}")
					.responder("/v23.0/178/media", MIDIAS);
			var instagram = instagram(facebook, ig, new TokenMeta("qualquer", arquivo(), json));

			assertThat(instagram.ler().valor()).isEqualTo(90L);
			assertThat(instagram.recentes()).extracting(Fontes.Publicacao::id).containsExactly("2");
			assertThat(ig.pedidos).isEmpty();
		}
	}

	@Test
	void tokenDoFacebookSemPaginaDizOQueFalta() throws Exception {
		try (var facebook = new Servidor(); var ig = new Servidor()) {
			facebook.responder("/v23.0/me", "{\"id\": \"u1\"}").responder("/v23.0/me/accounts", "{\"data\": []}");
			var instagram = instagram(facebook, ig, new TokenMeta("qualquer", arquivo(), json));

			assertThatThrownBy(instagram::ler).hasMessageContaining("pages_show_list");
		}
	}

	@Test
	void contaConfiguradaDispensaAcharAPagina() throws Exception {
		try (var facebook = new Servidor(); var ig = new Servidor()) {
			facebook.responder("/v23.0/me", "{\"id\": \"u1\"}").responder("/v23.0/178", "{\"followers_count\": 575}");
			var instagram = instagram(facebook, ig, new TokenMeta("qualquer", arquivo(), json), Optional.of("178"));

			assertThat(instagram.ler().valor()).isEqualTo(575L);
			assertThat(facebook.pedidos).extracting(p -> p.uri().getPath()).doesNotContain("/v23.0/me/accounts");
		}
	}

	@Test
	void tokenRecusadoPelosDoisTentaDeNovoDepois() throws Exception {
		try (var facebook = new Servidor(); var ig = new Servidor()) {
			var instagram = instagram(facebook, ig, new TokenMeta("ruim", arquivo(), json));
			assertThatThrownBy(instagram::ler).hasMessageContaining("recusado pelo Facebook");

			ig.responder("/v23.0/me", "{\"id\": \"9\", \"followers_count\": 3}");
			assertThat(instagram.ler().valor()).isEqualTo(3L);
		}
	}

	@Test
	void renovaOTokenDoInstagramEGuardaPraProximaVez() throws Exception {
		try (var facebook = new Servidor(); var ig = new Servidor()) {
			ig.responder("/v23.0/me", "{\"id\": \"9\"}").responder("/refresh_access_token", "{\"access_token\": \"IGnovo\", \"expires_in\": 5184000}");
			var arquivo = arquivo();
			var token = new TokenMeta("IGvelho", arquivo, json);
			instagram(facebook, ig, token).renovarToken();

			assertThat(token.get()).isEqualTo("IGnovo");
			assertThat(new TokenMeta("IGvelho", arquivo, json).get()).as("reinício usa o renovado").isEqualTo("IGnovo");
			assertThat(new TokenMeta("IGtrocadoNoEnv", arquivo, json).get()).as("META_API_KEY novo vence o arquivo").isEqualTo("IGtrocadoNoEnv");
		}
	}

	@Test
	void tokenDoFacebookNaoERenovadoAqui() throws Exception {
		try (var facebook = new Servidor(); var ig = new Servidor()) {
			facebook.responder("/v23.0/me", "{\"id\": \"u1\"}");
			instagram(facebook, ig, new TokenMeta("qualquer", arquivo(), json)).renovarToken();
			assertThat(ig.pedidos).isEmpty();
		}
	}
}
