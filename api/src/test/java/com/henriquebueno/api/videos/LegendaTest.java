package com.henriquebueno.api.videos;

import static org.assertj.core.api.Assertions.assertThat;

import java.util.List;

import org.junit.jupiter.api.Test;

class LegendaTest {

	static final List<String> CATEGORIAS = List.of("resiliencia", "concorrencia", "consistencia", "seguranca", "arquitetura");

	@Test
	void primeiraLinhaViraTituloEHashtagConhecidaViraCategoria() {
		var legenda = Legenda.de("1 API lenta derrubou tudo 🔥\n\nTimeout protege uma requisição.\n#java #resiliência #backend", CATEGORIAS);
		assertThat(legenda).isEqualTo(new Legenda("1 API lenta derrubou tudo 🔥", "resiliencia"));
	}

	@Test
	void hashtagsSaemDoTituloESeparadorQueSobraTambem() {
		assertThat(Legenda.de("#dev #java\nCPU em 5% e travado - #concorrencia", CATEGORIAS))
				.isEqualTo(new Legenda("CPU em 5% e travado", "concorrencia"));
	}

	@Test
	void semHashtagConhecidaFicaSemCategoria() {
		assertThat(Legenda.de("Como provar que ninguém mexeu? #urna #eleicao", CATEGORIAS).categoria()).isNull();
	}

	@Test
	void legendaVaziaOuSoComHashtagsGanhaTituloPadrao() {
		assertThat(Legenda.de(null, CATEGORIAS)).isEqualTo(new Legenda(Legenda.SEM_TITULO, null));
		assertThat(Legenda.de("#seguranca", CATEGORIAS)).isEqualTo(new Legenda(Legenda.SEM_TITULO, "seguranca"));
	}

	@Test
	void tituloLongoECortadoNumaPalavra() {
		var titulo = Legenda.de("palavra ".repeat(40), CATEGORIAS).titulo();
		assertThat(titulo).hasSizeLessThanOrEqualTo(Legenda.MAX_TITULO).endsWith("palavra…");
	}
}
