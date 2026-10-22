package com.henriquebueno.api.contato;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/** O que o formulário do site manda. {@code site} é a armadilha: humano não vê o campo, robô preenche. */
public record Mensagem(
		@NotBlank(message = "conta como posso te chamar") @Size(max = 120) String nome,
		@NotBlank(message = "falta o e-mail") @Email(message = "e-mail inválido") @Size(max = 200) String email,
		@Size(max = 160) String assunto,
		@NotBlank(message = "falta a mensagem") @Size(max = 5000) String mensagem,
		String site) {

	boolean deRobo() {
		return site != null && !site.isBlank();
	}
}
