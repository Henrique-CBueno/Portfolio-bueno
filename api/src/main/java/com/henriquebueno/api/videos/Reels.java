package com.henriquebueno.api.videos;

import java.io.IOException;
import java.io.InputStream;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.function.Function;
import java.util.stream.Collectors;

import org.jboss.logging.Logger;

import com.henriquebueno.api.PortfolioConfig;
import com.henriquebueno.api.capas.Capas;
import com.henriquebueno.api.capas.Imagem;
import com.henriquebueno.api.fontes.Fontes;
import com.henriquebueno.api.snapshot.Estado;
import com.henriquebueno.api.snapshot.Video;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;

/**
 * Transforma os Reels lidos do Instagram nos vídeos do site. A capa é copiada pro MinIO (o link do
 * Instagram expira) uma vez por Reel; capas de vídeos que saíram da lista são apagadas.
 */
@ApplicationScoped
public class Reels {

	private static final Logger log = Logger.getLogger(Reels.class);

	private final Estado estado;
	private final Capas capas;
	private final List<String> categorias;
	private final Function<URI, byte[]> baixar;

	@Inject
	Reels(Estado estado, Capas capas, PortfolioConfig config) {
		this(estado, capas, config.categorias(), Reels::baixar);
	}

	Reels(Estado estado, Capas capas, List<String> categorias, Function<URI, byte[]> baixar) {
		this.estado = estado;
		this.capas = capas;
		this.categorias = categorias;
		this.baixar = baixar;
	}

	public synchronized void sincronizar(List<Fontes.Publicacao> publicacoes) {
		var antes = estado.atual().videos().stream().collect(Collectors.toMap(Video::id, v -> v, (a, b) -> a));
		var videos = new ArrayList<Video>();
		for (var p : publicacoes) {
			var capa = "/capas/" + idDaCapa(p.id());
			var existente = antes.get(p.id());
			if (existente == null || !capa.equals(existente.capa())) {
				try {
					guardarCapa(idDaCapa(p.id()), p.capa());
				} catch (RuntimeException e) {
					// sem capa o card não aparece; a próxima rodada tenta de novo
					log.warnf("Capa do Reel %s não veio: %s", p.id(), e.getMessage());
					continue;
				}
			}
			var legenda = Legenda.de(p.legenda(), categorias);
			videos.add(new Video(p.id(), legenda.titulo(), p.link(), new Video.Links(p.link(), null, null), capa, p.publicadoEm(), legenda.categoria()));
		}
		estado.atualizarVideos(videos);

		var usadas = new HashSet<String>();
		videos.forEach(v -> usadas.add(v.capa()));
		antes.values().stream().map(Video::capa).filter(c -> !usadas.contains(c)).forEach(c -> capas.apagar(c.substring(c.lastIndexOf('/') + 1)));
	}

	/** Id do Reel (número) → id da capa no MinIO. */
	static String idDaCapa(String idDoReel) {
		return "ig-" + idDoReel.toLowerCase().replaceAll("[^a-z0-9-]", "");
	}

	private void guardarCapa(String id, String url) {
		var imagem = baixar.apply(URI.create(url));
		var tipo = Imagem.tipo(imagem).orElseThrow(() -> new IllegalStateException("capa não é JPEG, PNG nem WebP"));
		capas.guardar(id, imagem, tipo);
	}

	private static final HttpClient CLIENTE = HttpClient.newBuilder().connectTimeout(Duration.ofSeconds(3)).followRedirects(HttpClient.Redirect.NORMAL).build();

	private static byte[] baixar(URI url) {
		try {
			var resposta = CLIENTE.send(HttpRequest.newBuilder(url).timeout(Duration.ofSeconds(10)).build(), HttpResponse.BodyHandlers.ofInputStream());
			try (InputStream corpo = resposta.body()) {
				if (resposta.statusCode() / 100 != 2) throw new IllegalStateException("HTTP " + resposta.statusCode());
				var bytes = corpo.readNBytes(Imagem.MAX_BYTES + 1);
				if (bytes.length > Imagem.MAX_BYTES) throw new IllegalStateException("capa maior que 5 MB");
				return bytes;
			}
		} catch (IOException e) {
			throw new IllegalStateException(e.getMessage(), e);
		} catch (InterruptedException e) {
			Thread.currentThread().interrupt();
			throw new IllegalStateException(e);
		}
	}
}
