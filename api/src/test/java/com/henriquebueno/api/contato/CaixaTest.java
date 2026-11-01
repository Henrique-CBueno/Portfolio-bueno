package com.henriquebueno.api.contato;

import static org.assertj.core.api.Assertions.assertThat;

import java.nio.file.Files;
import java.time.Clock;
import java.time.Instant;
import java.time.ZoneOffset;

import org.junit.jupiter.api.Test;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;

class CaixaTest {

	final ObjectMapper json = new ObjectMapper().findAndRegisterModules().disable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS);
	final Clock relogio = Clock.fixed(Instant.parse("2026-11-01T12:00:00Z"), ZoneOffset.UTC);

	static Mensagem mensagem(String nome) {
		return new Mensagem(nome, nome + "@exemplo.com", " ", "Uma mensagem com mais de vinte caracteres.", null);
	}

	@Test
	void guardaAMaisNovaPrimeiroESobreviveAReinicio() throws Exception {
		var arquivo = Files.createTempDirectory("caixa").resolve("mensagens.json");
		var caixa = new Caixa(arquivo, json, relogio);
		caixa.guardar(mensagem("ana"));
		var bia = caixa.guardar(mensagem("bia"));

		assertThat(caixa.todas()).extracting(Recebida::nome).containsExactly("bia", "ana");
		assertThat(bia.assunto()).as("assunto só com espaço vira nulo").isNull();
		assertThat(new Caixa(arquivo, json, relogio).todas()).extracting(Recebida::nome).containsExactly("bia", "ana");
	}

	@Test
	void ficamSoAsUltimas500() throws Exception {
		var caixa = new Caixa(Files.createTempDirectory("caixa").resolve("mensagens.json"), json, relogio);
		for (int i = 0; i < Caixa.MAXIMO + 3; i++) caixa.guardar(mensagem("p" + i));

		assertThat(caixa.todas()).hasSize(Caixa.MAXIMO);
		assertThat(caixa.todas().getFirst().nome()).isEqualTo("p" + (Caixa.MAXIMO + 2));
	}

	@Test
	void arquivoIlegivelEGuardadoAParteENaoESobrescrito() throws Exception {
		var pasta = Files.createTempDirectory("caixa");
		var arquivo = pasta.resolve("mensagens.json");
		Files.writeString(arquivo, "isso não é json");

		var caixa = new Caixa(arquivo, json, relogio);
		caixa.guardar(mensagem("nova"));

		try (var arquivos = Files.list(pasta)) {
			var ilegivel = arquivos.filter(p -> p.getFileName().toString().startsWith("mensagens.json.ilegivel-")).findFirst();
			assertThat(ilegivel).isPresent();
			assertThat(Files.readString(ilegivel.get())).isEqualTo("isso não é json");
		}
		assertThat(caixa.todas()).extracting(Recebida::nome).containsExactly("nova");
	}

	@Test
	void respondidaTambemFicaLidaEGuardaQuando() throws Exception {
		var caixa = new Caixa(Files.createTempDirectory("caixa").resolve("mensagens.json"), json, relogio);
		var m = caixa.guardar(mensagem("ana"));

		var respondida = caixa.marcarRespondida(m.id(), true).orElseThrow();
		assertThat(respondida.respondida()).isTrue();
		assertThat(respondida.lida()).isTrue();
		assertThat(respondida.respondidaEm()).isEqualTo(Instant.parse("2026-11-01T12:00:00Z"));
		// "não lida" numa respondida não desfaz a leitura
		assertThat(caixa.marcarLida(m.id(), false).orElseThrow().lida()).isTrue();

		var desfeita = caixa.marcarRespondida(m.id(), false).orElseThrow();
		assertThat(desfeita.respondida()).isFalse();
		assertThat(desfeita.respondidaEm()).isNull();
	}

	@Test
	void marcaComoLidaEApaga() throws Exception {
		var caixa = new Caixa(Files.createTempDirectory("caixa").resolve("mensagens.json"), json, relogio);
		var m = caixa.guardar(mensagem("ana"));

		assertThat(caixa.marcarLida(m.id(), true)).hasValueSatisfying(r -> assertThat(r.lida()).isTrue());
		assertThat(caixa.todas().getFirst().lida()).isTrue();
		assertThat(caixa.marcarLida("nao-existe", true)).isEmpty();
		assertThat(caixa.apagar(m.id())).isTrue();
		assertThat(caixa.apagar(m.id())).isFalse();
		assertThat(caixa.todas()).isEmpty();
	}
}
