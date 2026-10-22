package com.henriquebueno.api.capas;

import jakarta.ws.rs.GET;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.PathParam;
import jakarta.ws.rs.core.Response;

@Path("/capas")
public class CapasRecurso {

	private final Capas capas;

	CapasRecurso(Capas capas) {
		this.capas = capas;
	}

	/** Cada capa nova ganha um id novo, então a mesma URL nunca muda de imagem: cache pra sempre. */
	@GET
	@Path("/{id}")
	public Response capa(@PathParam("id") String id) {
		if (!Capas.ID.matcher(id).matches()) return Response.status(Response.Status.NOT_FOUND).build();
		return capas.abrir(id)
				.map(a -> Response.ok(a.conteudo(), a.tipo()).header("Content-Length", a.tamanho()).header("Cache-Control", "public, max-age=31536000, immutable").build())
				.orElse(Response.status(Response.Status.NOT_FOUND).build());
	}
}
