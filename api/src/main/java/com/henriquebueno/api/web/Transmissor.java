package com.henriquebueno.api.web;

import java.util.List;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.henriquebueno.api.snapshot.Contagem;
import com.henriquebueno.api.snapshot.Estado;
import com.henriquebueno.api.snapshot.Eventos;

import io.quarkus.scheduler.Scheduled;
import jakarta.enterprise.event.Observes;
import jakarta.inject.Singleton;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.Context;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.sse.Sse;
import jakarta.ws.rs.sse.SseBroadcaster;
import jakarta.ws.rs.sse.SseEventSink;

/**
 * GET /stream: o navegador abre um EventSource e recebe o evento "contagens" na hora em que conecta
 * e sempre que um número muda. Um comentário a cada 25 s mantém a conexão viva atrás do Nginx.
 */
@Path("/stream")
@Singleton
public class Transmissor {

	private final Estado estado;
	private final ObjectMapper json;
	private Sse sse;
	private SseBroadcaster todos;

	Transmissor(Estado estado, ObjectMapper json) {
		this.estado = estado;
		this.json = json;
	}

	@GET
	@Produces(MediaType.SERVER_SENT_EVENTS)
	public void conectar(@Context SseEventSink conexao, @Context Sse sse) {
		iniciar(sse);
		conexao.send(evento(estado.atual().contagens()));
		todos.register(conexao);
	}

	void contagensMudaram(@Observes Eventos.ContagensMudaram e) {
		if (todos != null) todos.broadcast(evento(e.contagens()));
	}

	@Scheduled(every = "25s")
	void batimento() {
		if (todos != null) todos.broadcast(sse.newEventBuilder().comment("ping").build());
	}

	private synchronized void iniciar(Sse sse) {
		if (todos != null) return;
		this.sse = sse;
		this.todos = sse.newBroadcaster();
	}

	private jakarta.ws.rs.sse.OutboundSseEvent evento(List<Contagem> contagens) {
		try {
			return sse.newEventBuilder().name("contagens").data(json.writeValueAsString(contagens)).build();
		} catch (JsonProcessingException ex) {
			throw new IllegalStateException(ex);
		}
	}
}
