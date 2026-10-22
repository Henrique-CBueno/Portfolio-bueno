package com.henriquebueno.api.admin;

import java.net.URI;
import java.time.Clock;
import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalTime;
import java.time.ZoneId;
import java.time.format.DateTimeParseException;
import java.util.ArrayList;
import java.util.HexFormat;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.concurrent.ThreadLocalRandom;

import com.henriquebueno.api.PortfolioConfig;
import com.henriquebueno.api.capas.Capas;
import com.henriquebueno.api.capas.Imagem;
import com.henriquebueno.api.rebuild.Rebuild;
import com.henriquebueno.api.snapshot.Contagem;
import com.henriquebueno.api.snapshot.Estado;
import com.henriquebueno.api.snapshot.Rede;
import com.henriquebueno.api.snapshot.Video;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;

/**
 * O que o painel faz: cadastrar, editar e apagar vídeos (capa no MinIO, dados no snapshot) e
 * atualizar os números que não têm API. Toda mudança pede um rebuild do site.
 */
@ApplicationScoped
public class Catalogo {

	/** O que vem do formulário do painel, ainda sem validar. */
	public record Dados(String titulo, String categoria, String publicadoEm, String instagram, String tiktok, String youtube) {
	}

	static final ZoneId FUSO = ZoneId.of("America/Sao_Paulo");
	private static final Map<String, Set<String>> DOMINIOS = Map.of(
			"instagram", Set.of("instagram.com"),
			"tiktok", Set.of("tiktok.com"),
			"youtube", Set.of("youtube.com", "youtu.be"));

	private final Estado estado;
	private final Capas capas;
	private final Rebuild rebuild;
	private final List<String> categorias;
	private final Clock relogio;

	@Inject
	Catalogo(Estado estado, Capas capas, Rebuild rebuild, PortfolioConfig config) {
		this(estado, capas, rebuild, config.categorias(), Clock.systemUTC());
	}

	Catalogo(Estado estado, Capas capas, Rebuild rebuild, List<String> categorias, Clock relogio) {
		this.estado = estado;
		this.capas = capas;
		this.rebuild = rebuild;
		this.categorias = categorias;
		this.relogio = relogio;
	}

	public List<String> categorias() {
		return categorias;
	}

	public synchronized Video criar(Dados dados, byte[] capa) {
		var erros = new LinkedHashMap<String, String>();
		var valido = validar(dados, erros);
		var tipo = validarCapa(capa, true, erros);
		if (!erros.isEmpty()) throw new Invalido(erros);

		var capaId = novoId();
		capas.guardar(capaId, capa, tipo.orElseThrow());
		var video = valido.comoVideo(novoId(), "/capas/" + capaId);
		var lista = new ArrayList<>(estado.atual().videos());
		lista.add(video);
		estado.atualizarVideos(lista);
		rebuild.pedir();
		return video;
	}

	public synchronized Optional<Video> atualizar(String id, Dados dados, byte[] capaNova) {
		var atual = estado.atual().videos().stream().filter(v -> v.id().equals(id)).findFirst();
		if (atual.isEmpty()) return Optional.empty();

		var erros = new LinkedHashMap<String, String>();
		var valido = validar(dados, erros);
		var tipo = validarCapa(capaNova, false, erros);
		if (!erros.isEmpty()) throw new Invalido(erros);

		var capa = atual.get().capa();
		if (tipo.isPresent()) {
			var capaId = novoId();
			capas.guardar(capaId, capaNova, tipo.get());
			capa = "/capas/" + capaId;
		}
		var video = valido.comoVideo(id, capa);
		estado.atualizarVideos(estado.atual().videos().stream().map(v -> v.id().equals(id) ? video : v).toList());
		if (!capa.equals(atual.get().capa())) capas.apagar(idDaCapa(atual.get().capa()));
		rebuild.pedir();
		return Optional.of(video);
	}

	public synchronized boolean apagar(String id) {
		var alvo = estado.atual().videos().stream().filter(v -> v.id().equals(id)).findFirst();
		if (alvo.isEmpty()) return false;
		estado.atualizarVideos(estado.atual().videos().stream().filter(v -> !v.id().equals(id)).toList());
		capas.apagar(idDaCapa(alvo.get().capa()));
		rebuild.pedir();
		return true;
	}

	/** Instagram e TikTok não têm API ligada: o número é digitado no painel (nulo = esconder). */
	public synchronized Contagem contagem(Rede rede, Long valor) {
		if (rede == Rede.YOUTUBE) throw new Invalido(Map.of("rede", "o YouTube é lido pela API dele"));
		if (valor != null && valor < 0) throw new Invalido(Map.of("valor", "não pode ser negativo"));
		var contagem = Contagem.manual(rede, valor, relogio.instant());
		estado.atualizarContagem(contagem);
		rebuild.pedir();
		return contagem;
	}

	private record Valido(String titulo, String categoria, Instant publicadoEm, Video.Links links) {
		Video comoVideo(String id, String capa) {
			return new Video(id, titulo, links.principal(), links, capa, publicadoEm, categoria);
		}
	}

	private Valido validar(Dados d, Map<String, String> erros) {
		var titulo = limpo(d.titulo());
		if (titulo == null) erros.put("titulo", "falta o título");
		else if (titulo.length() > 120) erros.put("titulo", "no máximo 120 caracteres");

		var categoria = limpo(d.categoria());
		if (categoria != null && !categorias.contains(categoria)) erros.put("categoria", "categoria desconhecida");

		Instant publicadoEm = null;
		var data = limpo(d.publicadoEm());
		if (data == null) erros.put("publicadoEm", "falta a data");
		else {
			try {
				publicadoEm = LocalDate.parse(data).atTime(LocalTime.NOON).atZone(FUSO).toInstant();
			} catch (DateTimeParseException e) {
				erros.put("publicadoEm", "data inválida (use AAAA-MM-DD)");
			}
		}

		var links = new Video.Links(link("instagram", d.instagram(), erros), link("tiktok", d.tiktok(), erros), link("youtube", d.youtube(), erros));
		if (links.principal() == null && !erros.containsKey("instagram") && !erros.containsKey("tiktok") && !erros.containsKey("youtube")) {
			erros.put("links", "coloque o link de pelo menos uma rede");
		}
		return new Valido(titulo, categoria, publicadoEm, links);
	}

	private static String link(String rede, String valor, Map<String, String> erros) {
		var url = limpo(valor);
		if (url == null) return null;
		try {
			var uri = URI.create(url);
			var host = uri.getHost() == null ? "" : uri.getHost().toLowerCase().replaceFirst("^(www\\.|m\\.|vm\\.)", "");
			if (!"https".equals(uri.getScheme()) || DOMINIOS.get(rede).stream().noneMatch(host::equals)) {
				erros.put(rede, "link do " + rede + " inválido (https://" + DOMINIOS.get(rede).iterator().next() + "/…)");
				return null;
			}
			return uri.toString();
		} catch (IllegalArgumentException e) {
			erros.put(rede, "link inválido");
			return null;
		}
	}

	private static Optional<String> validarCapa(byte[] capa, boolean obrigatoria, Map<String, String> erros) {
		if (capa == null || capa.length == 0) {
			if (obrigatoria) erros.put("capa", "falta a capa");
			return Optional.empty();
		}
		if (capa.length > Imagem.MAX_BYTES) {
			erros.put("capa", "capa maior que 5 MB");
			return Optional.empty();
		}
		var tipo = Imagem.tipo(capa);
		if (tipo.isEmpty()) erros.put("capa", "a capa precisa ser JPEG, PNG ou WebP");
		return tipo;
	}

	private static String limpo(String s) {
		return s == null || s.isBlank() ? null : s.strip();
	}

	private static String novoId() {
		var bytes = new byte[8];
		ThreadLocalRandom.current().nextBytes(bytes);
		return HexFormat.of().formatHex(bytes);
	}

	private static String idDaCapa(String caminho) {
		return caminho.substring(caminho.lastIndexOf('/') + 1);
	}
}
