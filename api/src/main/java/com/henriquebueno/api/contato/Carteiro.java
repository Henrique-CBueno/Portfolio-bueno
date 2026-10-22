package com.henriquebueno.api.contato;

import com.henriquebueno.api.PortfolioConfig;

import io.quarkus.mailer.Mail;
import io.quarkus.mailer.Mailer;
import jakarta.enterprise.context.ApplicationScoped;

/**
 * Entrega a mensagem no e-mail de contato, com o e-mail do visitante no "responder para".
 * Com MAIL_MOCK=true (padrão fora de produção) o Quarkus só registra o e-mail no log.
 */
@ApplicationScoped
class Carteiro {

	private final Mailer mailer;
	private final String para;

	Carteiro(Mailer mailer, PortfolioConfig config) {
		this.mailer = mailer;
		this.para = config.contato().para();
	}

	void entregar(Mensagem m) {
		var assunto = m.assunto() == null || m.assunto().isBlank() ? "mensagem de " + m.nome() : m.assunto();
		mailer.send(Mail.withText(para, "[site] " + umaLinha(assunto), """
				%s <%s> escreveu pelo formulário do site:

				%s
				""".formatted(umaLinha(m.nome()), umaLinha(m.email()), m.mensagem()))
				.setReplyTo(umaLinha(m.email())));
	}

	/** Cabeçalho de e-mail não pode ter quebra de linha (evita injeção de cabeçalhos). */
	static String umaLinha(String texto) {
		return texto.replaceAll("[\\r\\n]+", " ").strip();
	}
}
