package com.henriquebueno.api.videos;

import java.text.Normalizer;
import java.util.List;
import java.util.regex.Pattern;

/**
 * O que o card mostra a partir da legenda do Reel: o título é a primeira linha com texto (sem hashtags)
 * e a categoria é a primeira hashtag que for uma categoria conhecida (#resiliência ou #resiliencia).
 */
public record Legenda(String titulo, String categoria) {

	static final int MAX_TITULO = 120;
	static final String SEM_TITULO = "Vídeo novo no Instagram";
	private static final Pattern HASHTAG = Pattern.compile("#([\\p{L}\\p{N}_]+)");

	public static Legenda de(String legenda, List<String> categorias) {
		if (legenda == null || legenda.isBlank()) return new Legenda(SEM_TITULO, null);
		return new Legenda(titulo(legenda), categoria(legenda, categorias));
	}

	private static String titulo(String legenda) {
		for (var linha : legenda.split("\\R")) {
			var limpa = HASHTAG.matcher(linha).replaceAll("").replaceAll("\\s+", " ").strip();
			// sobra de separador depois de tirar as hashtags ("Título -", "Título |")
			limpa = limpa.replaceAll("[\\s\\-–—|·•]+$", "").strip();
			if (!limpa.isEmpty()) return cortar(limpa);
		}
		return SEM_TITULO;
	}

	private static String cortar(String texto) {
		if (texto.length() <= MAX_TITULO) return texto;
		var corte = texto.lastIndexOf(' ', MAX_TITULO - 1);
		return texto.substring(0, corte > MAX_TITULO / 2 ? corte : MAX_TITULO - 1).strip() + "…";
	}

	private static String categoria(String legenda, List<String> categorias) {
		var hashtags = HASHTAG.matcher(legenda);
		while (hashtags.find()) {
			var chave = semAcento(hashtags.group(1)).toLowerCase();
			if (categorias.contains(chave)) return chave;
		}
		return null;
	}

	private static String semAcento(String s) {
		return Normalizer.normalize(s, Normalizer.Form.NFD).replaceAll("\\p{M}", "");
	}
}
