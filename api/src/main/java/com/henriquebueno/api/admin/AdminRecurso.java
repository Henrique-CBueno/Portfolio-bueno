package com.henriquebueno.api.admin;

import java.util.List;
import java.util.Map;

import org.jboss.resteasy.reactive.server.ServerExceptionMapper;

import com.henriquebueno.api.contato.Caixa;
import com.henriquebueno.api.contato.Recebida;
import com.henriquebueno.api.snapshot.Rede;

import jakarta.annotation.security.RolesAllowed;
import jakarta.ws.rs.Consumes;
import jakarta.ws.rs.DELETE;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.PUT;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.PathParam;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;

/**
 * Rotas do painel /admin do site. Só com token do Keycloak e o papel "admin".
 * Os vídeos vêm do Instagram; o painel cuida das mensagens do formulário e dos números sem API ligada.
 */
@Path("/admin-api")
@RolesAllowed("admin")
@Produces(MediaType.APPLICATION_JSON)
public class AdminRecurso {

	public record NovoValor(Long valor) {
	}

	public record Lida(boolean lida) {
	}

	private final Numeros numeros;
	private final Caixa caixa;

	AdminRecurso(Numeros numeros, Caixa caixa) {
		this.numeros = numeros;
		this.caixa = caixa;
	}

	/** Mensagens do formulário de contato, a mais nova primeiro. */
	@GET
	@Path("/mensagens")
	public List<Recebida> mensagens() {
		return caixa.todas();
	}

	@PUT
	@Path("/mensagens/{id}/lida")
	@Consumes(MediaType.APPLICATION_JSON)
	public Response marcarLida(@PathParam("id") String id, Lida corpo) {
		return caixa.marcarLida(id, corpo == null || corpo.lida())
				.map(m -> Response.ok(m).build())
				.orElse(Response.status(Response.Status.NOT_FOUND).build());
	}

	@DELETE
	@Path("/mensagens/{id}")
	public Response apagar(@PathParam("id") String id) {
		return caixa.apagar(id) ? Response.noContent().build() : Response.status(Response.Status.NOT_FOUND).build();
	}

	@GET
	@Path("/contagens")
	public List<Numeros.NoPainel> contagens() {
		return numeros.noPainel();
	}

	@PUT
	@Path("/contagens/{rede}")
	@Consumes(MediaType.APPLICATION_JSON)
	public Response contagem(@PathParam("rede") String rede, NovoValor corpo) {
		var r = switch (rede) {
			case "instagram" -> Rede.INSTAGRAM;
			case "tiktok" -> Rede.TIKTOK;
			case "youtube" -> Rede.YOUTUBE;
			default -> null;
		};
		if (r == null) return Response.status(Response.Status.NOT_FOUND).build();
		return Response.ok(numeros.digitar(r, corpo == null ? null : corpo.valor())).build();
	}

	@ServerExceptionMapper
	Response invalido(Invalido e) {
		return Response.status(Response.Status.BAD_REQUEST).type(MediaType.APPLICATION_JSON).entity(Map.of("ok", false, "erros", e.erros)).build();
	}
}
