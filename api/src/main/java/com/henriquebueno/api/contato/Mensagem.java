package com.henriquebueno.api.contato;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

/**
 * O que o formulário do site manda. {@code site} é a armadilha: humano não vê o campo, robô preenche.
 * Os textos são os mesmos que o site mostra embaixo de cada campo (site/src/lib/contato.ts): mude nos dois.
 */
public record Mensagem(
		@NotBlank(message = "conta como posso te chamar")
		@Size(max = 120, message = "nome com no máximo 120 caracteres") String nome,

		@NotBlank(message = "falta o e-mail")
		@Email(message = "e-mail inválido")
		@Pattern(regexp = "[^\\s@]+@[^\\s@]+\\.[^\\s@]+", message = "e-mail inválido")
		@Size(max = 200, message = "e-mail com no máximo 200 caracteres") String email,

		@Size(max = 160, message = "assunto com no máximo 160 caracteres") String assunto,

		@NotBlank(message = "falta a mensagem")
		@Size(min = MINIMO_MENSAGEM, message = "mensagem com no mínimo 20 caracteres")
		@Size(max = 5000, message = "mensagem com no máximo 5000 caracteres") String mensagem,

		String site) {

	static final int MINIMO_MENSAGEM = 20;

	/** Espaço nas pontas não conta: "   oi   " não passa por uma mensagem de 20 caracteres. */
	public Mensagem {
		nome = limpo(nome);
		email = limpo(email);
		assunto = limpo(assunto);
		mensagem = limpo(mensagem);
	}

	boolean deRobo() {
		return site != null && !site.isBlank();
	}

	private static String limpo(String s) {
		return s == null ? null : s.strip();
	}
}
