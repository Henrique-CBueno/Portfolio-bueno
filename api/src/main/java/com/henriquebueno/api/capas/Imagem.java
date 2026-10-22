package com.henriquebueno.api.capas;

import java.util.Optional;

/** Confere pelos primeiros bytes (e não pela extensão) que o arquivo é mesmo JPEG, PNG ou WebP. */
public final class Imagem {

	public static final int MAX_BYTES = 5 * 1024 * 1024;

	private Imagem() {
	}

	public static Optional<String> tipo(byte[] b) {
		if (b.length > 3 && (b[0] & 0xFF) == 0xFF && (b[1] & 0xFF) == 0xD8 && (b[2] & 0xFF) == 0xFF) return Optional.of("image/jpeg");
		if (b.length > 8 && (b[0] & 0xFF) == 0x89 && b[1] == 'P' && b[2] == 'N' && b[3] == 'G') return Optional.of("image/png");
		if (b.length > 12 && b[0] == 'R' && b[1] == 'I' && b[2] == 'F' && b[3] == 'F' && b[8] == 'W' && b[9] == 'E' && b[10] == 'B' && b[11] == 'P') return Optional.of("image/webp");
		return Optional.empty();
	}
}
