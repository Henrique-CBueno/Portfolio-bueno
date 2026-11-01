package com.henriquebueno.api.fontes;

import java.time.Instant;
import java.util.List;

import com.henriquebueno.api.snapshot.Contagem;
import com.henriquebueno.api.snapshot.Rede;
import com.henriquebueno.api.snapshot.Repositorio;

/** O que vem de fora automaticamente: números do YouTube e do Instagram, Reels do Instagram e repositórios fixados do GitHub. */
public final class Fontes {

	private Fontes() {
	}

	public interface DeContagem {
		Rede rede();

		Contagem ler();
	}

	public interface DeRepositorios {
		List<Repositorio> fixados();
	}

	/** Um vídeo publicado numa rede, como veio dela: a legenda ainda não virou título nem categoria. */
	public record Publicacao(String id, String legenda, String link, String capa, Instant publicadoEm) {
	}

	public interface DeVideos {
		/** Os vídeos mais recentes, do mais novo pro mais antigo. */
		List<Publicacao> recentes();
	}
}
