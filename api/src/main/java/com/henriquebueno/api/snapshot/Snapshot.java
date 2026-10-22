package com.henriquebueno.api.snapshot;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

/** O que o site lê no build (GET /snapshot). Imutável: cada mudança gera um snapshot novo. Vídeos vêm do mais novo pro mais antigo. */
public record Snapshot(Instant lidoEm, List<Video> videos, List<Contagem> contagens, List<Repositorio> repositorios) {

	public Snapshot {
		videos = List.copyOf(videos);
		contagens = List.copyOf(contagens);
		repositorios = List.copyOf(repositorios);
	}

	public static Snapshot vazio() {
		return new Snapshot(Instant.EPOCH, List.of(),
				List.of(Contagem.semValor(Rede.INSTAGRAM), Contagem.semValor(Rede.TIKTOK), Contagem.semValor(Rede.YOUTUBE)),
				List.of());
	}

	public Snapshot comVideos(List<Video> novos, Instant agora) {
		var ordenados = novos.stream().sorted(java.util.Comparator.comparing(Video::publicadoEm).reversed()).toList();
		return new Snapshot(agora, ordenados, contagens, repositorios);
	}

	public Snapshot comRepositorios(List<Repositorio> novos, Instant agora) {
		return new Snapshot(agora, videos, contagens, novos);
	}

	public Snapshot comContagem(Contagem nova, Instant agora) {
		var lista = new ArrayList<Contagem>(contagens.size());
		boolean trocou = false;
		for (var c : contagens) {
			if (c.rede() == nova.rede()) {
				lista.add(nova);
				trocou = true;
			} else {
				lista.add(c);
			}
		}
		if (!trocou) lista.add(nova);
		return new Snapshot(agora, videos, lista, repositorios);
	}

}
