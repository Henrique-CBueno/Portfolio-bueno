package com.henriquebueno.api.contato;

import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.Map;

import org.jboss.logging.Logger;
import org.jboss.resteasy.reactive.server.ServerExceptionMapper;

import io.vertx.core.http.HttpServerRequest;
import jakarta.validation.ConstraintViolation;
import jakarta.validation.ConstraintViolationException;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.Valid;
import jakarta.ws.rs.Consumes;
import jakarta.ws.rs.POST;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.Context;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;

@Path("/contato")
@Consumes(MediaType.APPLICATION_JSON)
@Produces(MediaType.APPLICATION_JSON)
public class ContatoRecurso {

	private static final Logger log = Logger.getLogger(ContatoRecurso.class);

	private final Limite limite;
	private final Carteiro carteiro;
	private final Caixa caixa;

	ContatoRecurso(Limite limite, Carteiro carteiro, Caixa caixa) {
		this.limite = limite;
		this.carteiro = carteiro;
		this.caixa = caixa;
	}

	@POST
	public Response contato(@Valid Mensagem mensagem, @Context HttpServerRequest pedido) {
		// robô ganha a mesma resposta de sucesso pra não aprender que foi pego
		if (mensagem.deRobo()) return resposta(202, Map.of("ok", true));
		if (!limite.permitir(pedido.remoteAddress().host())) {
			return resposta(429, Map.of("ok", false, "erro", "muitas mensagens seguidas; tente daqui a pouco"));
		}
		// primeiro guarda (aparece no painel /admin), depois avisa por e-mail
		try {
			caixa.guardar(mensagem);
		} catch (RuntimeException e) {
			log.errorf(e, "Mensagem de contato não foi guardada");
			return resposta(503, Map.of("ok", false, "erro", "não deu pra enviar agora"));
		}
		try {
			carteiro.entregar(mensagem);
		} catch (RuntimeException e) {
			// a mensagem já está no painel; o visitante não precisa mandar de novo
			log.warnf("E-mail de contato não saiu (a mensagem está no painel): %s", e);
		}
		return resposta(202, Map.of("ok", true));
	}

	/**
	 * Campo inválido: uma mensagem por campo, pro site mostrar embaixo dele. Um campo pode quebrar várias regras
	 * (vazio também é curto); vale a mais básica: falta, depois formato, depois tamanho.
	 */
	@ServerExceptionMapper
	Response invalido(ConstraintViolationException e) {
		var erros = new LinkedHashMap<String, String>();
		e.getConstraintViolations().stream()
				.sorted(Comparator.comparingInt(ContatoRecurso::prioridade))
				.forEach(v -> {
					var caminho = v.getPropertyPath().toString();
					erros.putIfAbsent(caminho.substring(caminho.lastIndexOf('.') + 1), v.getMessage());
				});
		return resposta(400, Map.of("ok", false, "erros", erros));
	}

	private static int prioridade(ConstraintViolation<?> v) {
		var tipo = v.getConstraintDescriptor().getAnnotation().annotationType();
		if (tipo == NotBlank.class) return 0;
		if (tipo == Email.class || tipo == Pattern.class) return 1;
		return 2;
	}

	private static Response resposta(int status, Object corpo) {
		return Response.status(status).type(MediaType.APPLICATION_JSON).entity(corpo).build();
	}
}
