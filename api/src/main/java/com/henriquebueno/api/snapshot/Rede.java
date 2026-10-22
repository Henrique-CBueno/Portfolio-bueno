package com.henriquebueno.api.snapshot;

import com.fasterxml.jackson.annotation.JsonValue;

public enum Rede {
	INSTAGRAM, TIKTOK, YOUTUBE;

	@JsonValue
	public String chave() {
		return name().toLowerCase();
	}
}
