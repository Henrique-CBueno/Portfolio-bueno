package com.henriquebueno.api.admin;

import java.util.Map;

/** Dados do painel com problema: campo → o que corrigir. Vira 400 com {@code erros}. */
public class Invalido extends RuntimeException {

	final Map<String, String> erros;

	Invalido(Map<String, String> erros) {
		super(erros.toString());
		this.erros = erros;
	}
}
