package com.henriquebueno.api.snapshot;

import static org.assertj.core.api.Assertions.assertThat;

import java.nio.file.Path;
import java.time.Clock;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;

class EstadoTest {

	@TempDir
	Path dados;

	private final ObjectMapper json = new ObjectMapper().findAndRegisterModules().disable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS);
	private final List<Object> eventos = new ArrayList<>();

	@Test
	void avisaSoQuandoONumeroMuda() {
		var estado = novoEstado();
		estado.atualizarContagem(Contagem.automatica(Rede.INSTAGRAM, 10L, false));
		estado.atualizarContagem(Contagem.automatica(Rede.INSTAGRAM, 10L, false));
		estado.atualizarContagem(Contagem.automatica(Rede.INSTAGRAM, 11L, false));

		assertThat(eventos).hasSize(2).allMatch(Eventos.ContagensMudaram.class::isInstance);
	}

	@Test
	void videosFicamDoMaisNovoProMaisAntigo() {
		var estado = novoEstado();
		var velho = new Video("velho", "A", "https://x", new Video.Links("https://x", null, null), "/capas/a", Instant.parse("2026-01-01T00:00:00Z"), null);
		var novo = new Video("novo", "B", "https://x", new Video.Links("https://x", null, null), "/capas/b", Instant.parse("2026-10-01T00:00:00Z"), null);
		estado.atualizarVideos(List.of(velho, novo));

		assertThat(estado.atual().videos()).extracting(Video::id).containsExactly("novo", "velho");
	}

	@Test
	void sobreviveAReinicio() {
		var estado = novoEstado();
		var v = new Video("1", "Título", "https://x", new Video.Links(null, "https://x", null), "/capas/1", Instant.parse("2026-10-20T00:00:00Z"), null);
		estado.atualizarVideos(List.of(v));
		estado.atualizarContagem(Contagem.automatica(Rede.YOUTUBE, 96L, true));
		estado.atualizarRepositorios(List.of(new Repositorio("repo", null, List.of("Java"), "https://github.com/u/repo", null, null)));

		var depois = novoEstado().atual();

		assertThat(depois.videos()).containsExactly(v);
		assertThat(depois.contagens()).contains(Contagem.automatica(Rede.YOUTUBE, 96L, true), Contagem.semValor(Rede.TIKTOK));
		assertThat(depois.repositorios()).extracting(Repositorio::nome).containsExactly("repo");
	}

	@Test
	void snapshotDeAntesDosDestaquesCarregaComPadrao() throws Exception {
		java.nio.file.Files.createDirectories(dados);
		java.nio.file.Files.writeString(dados.resolve("snapshot.json"), """
				{"lidoEm": "2026-10-01T00:00:00Z", "videos": [], "contagens": [], "repositorios": [{"nome": "r", "linguagens": ["Java"], "url": "https://github.com/u/r"}]}""");
		var atual = novoEstado().atual();

		assertThat(atual.repositorios()).extracting(Repositorio::nome).containsExactly("r");
		assertThat(atual.publicos()).isEmpty();
		assertThat(atual.destaques()).isNull();
	}

	private Estado novoEstado() {
		return new Estado(dados, json, Clock.systemUTC(), eventos::add);
	}
}
