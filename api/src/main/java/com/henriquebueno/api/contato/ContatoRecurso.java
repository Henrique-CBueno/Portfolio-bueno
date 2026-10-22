package com.henriquebueno.api.contato;

import java.util.LinkedHashMap;
import java.util.Map;

import org.jboss.logging.Logger;
import org.jboss.resteasy.reactive.server.ServerExceptionMapper;

import io.vertx.core.http.HttpServerRequest;
import jakarta.validation.ConstraintViolationException;
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

	ContatoRecurso(Limite limite, Carteiro carteiro) {
		this.limite = limite;
		this.carteiro = carteiro;
	}

	@POST
	public Response contato(@Valid Mensagem mensagem, @Context HttpServerRequest pedido) {
		// robô ganha a mesma resposta de sucesso pra não aprender que foi pego
		if (mensagem.deRobo()) return resposta(202, Map.of("ok", true));
		if (!limite.permitir(pedido.remoteAddress().host())) {
			return resposta(429, Map.of("ok", false, "erro", "muitas mensagens seguidas; tente daqui a pouco"));
		}
		try {
			carteiro.entregar(mensagem);
		} catch (RuntimeException e) {
			log.warnf("E-mail de contato não saiu: %s", e);
			return resposta(503, Map.of("ok", false, "erro", "não deu pra enviar agora"));
		}
		return resposta(202, Map.of("ok", true));
	}

	/** Campo inválido: devolve o que falta em cada campo, pro site poder mostrar. */
	@ServerExceptionMapper
	Response invalido(ConstraintViolationException e) {
		var erros = new LinkedHashMap<String, String>();
		e.getConstraintViolations().forEach(v -> {
			var caminho = v.getPropertyPath().toString();
			erros.putIfAbsent(caminho.substring(caminho.lastIndexOf('.') + 1), v.getMessage());
		});
		return resposta(400, Map.of("ok", false, "erros", erros));
	}

	private static Response resposta(int status, Object corpo) {
		return Response.status(status).type(MediaType.APPLICATION_JSON).entity(corpo).build();
	}
}
