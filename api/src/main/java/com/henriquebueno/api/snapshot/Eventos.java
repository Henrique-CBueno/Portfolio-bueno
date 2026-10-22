package com.henriquebueno.api.snapshot;

import java.util.List;

/** Eventos CDI disparados pelo {@link Estado}. */
public final class Eventos {

	private Eventos() {
	}

	public record ContagensMudaram(List<Contagem> contagens) {
	}

	public record VideosMudaram(List<Video> antes, List<Video> depois) {
	}
}
