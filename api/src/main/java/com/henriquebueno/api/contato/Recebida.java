package com.henriquebueno.api.contato;

import java.time.Instant;

/** Mensagem que chegou pelo formulário, guardada pra ler no painel /admin. */
public record Recebida(String id, Instant recebidaEm, String nome, String email, String assunto, String mensagem, boolean lida) {

	Recebida comLida(boolean novaLida) {
		return new Recebida(id, recebidaEm, nome, email, assunto, mensagem, novaLida);
	}
}
