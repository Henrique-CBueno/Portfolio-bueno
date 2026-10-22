package com.henriquebueno.api.snapshot;

import java.time.Instant;

/**
 * Um vídeo da vitrine, cadastrado no painel. {@code link} é pra onde o card leva (Instagram, senão
 * TikTok, senão YouTube); {@code capa} é um caminho desta API ({@code /capas/<id>}).
 */
public record Video(String id, String titulo, String link, Links links, String capa, Instant publicadoEm, String categoria) {

	/** Onde o mesmo vídeo está publicado. Pelo menos um vem preenchido. */
	public record Links(String instagram, String tiktok, String youtube) {

		public String principal() {
			if (instagram != null) return instagram;
			if (tiktok != null) return tiktok;
			return youtube;
		}
	}
}
