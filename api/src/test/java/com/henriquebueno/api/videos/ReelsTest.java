package com.henriquebueno.api.videos;

import static org.assertj.core.api.Assertions.assertThat;

import java.net.URI;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

import org.junit.jupiter.api.Test;

import com.henriquebueno.api.capas.CapasEmMemoria;
import com.henriquebueno.api.fontes.Fontes;
import com.henriquebueno.api.snapshot.Estado;
import com.henriquebueno.api.snapshot.EstadoTeste;
import com.henriquebueno.api.snapshot.Video;

class ReelsTest {

	static final byte[] JPEG = { (byte) 0xFF, (byte) 0xD8, (byte) 0xFF, (byte) 0xE0, 0, 0x10, 'J', 'F', 'I', 'F', 0, 1 };

	final CapasEmMemoria capas = new CapasEmMemoria();
	final List<URI> baixadas = new ArrayList<>();
	final Estado estado = EstadoTeste.novo();
	final Reels reels = new Reels(estado, capas, LegendaTest.CATEGORIAS, url -> {
		baixadas.add(url);
		if (url.getPath().contains("quebrada")) throw new IllegalStateException("HTTP 403");
		return JPEG;
	});

	static Fontes.Publicacao reel(String id, String legenda, String dia) {
		return new Fontes.Publicacao(id, legenda, "https://www.instagram.com/reel/" + id + "/", "https://cdn.instagram/" + id + ".jpg", Instant.parse(dia + "T18:00:00Z"));
	}

	@Test
	void reelViraVideoComCapaGuardadaUmaVezSo() {
		reels.sincronizar(List.of(reel("17", "1 assento vendido 2 vezes\n#consistencia", "2026-10-17")));
		reels.sincronizar(List.of(reel("17", "1 assento vendido 2 vezes\n#consistencia", "2026-10-17")));

		assertThat(estado.atual().videos()).containsExactly(new Video("17", "1 assento vendido 2 vezes", "https://www.instagram.com/reel/17/",
				new Video.Links("https://www.instagram.com/reel/17/", null, null), "/capas/ig-17", Instant.parse("2026-10-17T18:00:00Z"), "consistencia"));
		assertThat(capas.tem("ig-17")).isTrue();
		assertThat(baixadas).as("a capa só é baixada na primeira vez").hasSize(1);
	}

	@Test
	void reelQueSaiDoInstagramLevaACapaJunto() {
		reels.sincronizar(List.of(reel("2", "Novo", "2026-10-20"), reel("1", "Velho", "2026-10-10")));
		reels.sincronizar(List.of(reel("2", "Novo", "2026-10-20")));

		assertThat(estado.atual().videos()).extracting(Video::id).containsExactly("2");
		assertThat(capas.tem("ig-1")).isFalse();
		assertThat(capas.tem("ig-2")).isTrue();
	}

	@Test
	void reelSemCapaFicaDeForaAteAProximaRodada() {
		var quebrado = new Fontes.Publicacao("9", "Sem capa", "https://www.instagram.com/reel/9/", "https://cdn.instagram/quebrada.jpg", Instant.parse("2026-10-21T18:00:00Z"));
		reels.sincronizar(List.of(quebrado, reel("3", "Com capa", "2026-10-19")));

		assertThat(estado.atual().videos()).extracting(Video::id).containsExactly("3");
	}
}
