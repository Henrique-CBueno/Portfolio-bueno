package com.henriquebueno.api.snapshot;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

/**
 * O que o site lê (GET /snapshot). Imutável: cada mudança gera um snapshot novo. Vídeos vêm do mais novo pro mais antigo.
 * {@code repositorios}: os fixados (ou os mais recentes, sem token). {@code publicos}: todos os públicos, candidatos a destaque.
 * {@code destaques}: o que o painel escolheu pra "Projetos em destaque", em ordem ("projeto:revi", "github:Cinema-API");
 * nulo = nunca escolhido (o site mostra os projetos curados).
 */
public record Snapshot(Instant lidoEm, List<Video> videos, List<Contagem> contagens, List<Repositorio> repositorios,
		List<Repositorio> publicos, List<String> destaques) {

	public Snapshot {
		videos = List.copyOf(videos);
		contagens = List.copyOf(contagens);
		repositorios = List.copyOf(repositorios);
		// snapshot.json de antes desses campos chega sem eles
		publicos = publicos == null ? List.of() : List.copyOf(publicos);
		destaques = destaques == null ? null : List.copyOf(destaques);
	}

	public static Snapshot vazio() {
		return new Snapshot(Instant.EPOCH, List.of(),
				List.of(Contagem.semValor(Rede.INSTAGRAM), Contagem.semValor(Rede.TIKTOK), Contagem.semValor(Rede.YOUTUBE)),
				List.of(), List.of(), null);
	}

	public Snapshot comVideos(List<Video> novos, Instant agora) {
		var ordenados = novos.stream().sorted(java.util.Comparator.comparing(Video::publicadoEm).reversed()).toList();
		return new Snapshot(agora, ordenados, contagens, repositorios, publicos, destaques);
	}

	public Snapshot comRepositorios(List<Repositorio> novos, Instant agora) {
		return new Snapshot(agora, videos, contagens, novos, publicos, destaques);
	}

	public Snapshot comPublicos(List<Repositorio> novos, Instant agora) {
		return new Snapshot(agora, videos, contagens, repositorios, novos, destaques);
	}

	public Snapshot comDestaques(List<String> novos, Instant agora) {
		return new Snapshot(agora, videos, contagens, repositorios, publicos, novos);
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
		return new Snapshot(agora, videos, lista, repositorios, publicos, destaques);
	}

}
