package com.henriquebueno.api.contato;

import java.time.Instant;

/**
 * Mensagem que chegou pelo formulário, guardada pra ler no painel /admin. {@code respondida} é marcada à mão
 * no painel (responder abre o e-mail, a API não sabe se ele saiu); marcar como respondida também marca como lida.
 */
public record Recebida(String id, Instant recebidaEm, String nome, String email, String assunto, String mensagem,
		boolean lida, boolean respondida, Instant respondidaEm) {

	Recebida comLida(boolean novaLida) {
		// desmarcar "lida" de uma respondida não faz sentido: ela continua lida
		return new Recebida(id, recebidaEm, nome, email, assunto, mensagem, novaLida || respondida, respondida, respondidaEm);
	}

	Recebida comRespondida(boolean nova, Instant agora) {
		return new Recebida(id, recebidaEm, nome, email, assunto, mensagem, lida || nova, nova, nova ? agora : null);
	}
}
