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
 * Os vídeos vêm do Instagram; o painel cuida das mensagens do formulário, dos projetos em destaque e dos números sem API ligada.
 */
@Path("/admin-api")
@RolesAllowed("admin")
@Produces(MediaType.APPLICATION_JSON)
public class AdminRecurso {

	public record NovoValor(Long valor) {
	}

	public record Lida(boolean lida) {
	}

	public record Respondida(boolean respondida) {
	}

	public record Selecao(List<String> selecao) {
	}

	private final Numeros numeros;
	private final Caixa caixa;
	private final Destaques destaques;

	AdminRecurso(Numeros numeros, Caixa caixa, Destaques destaques) {
		this.numeros = numeros;
		this.caixa = caixa;
		this.destaques = destaques;
	}

	/** Seleção atual dos projetos em destaque e os repositórios do GitHub que podem entrar nela. */
	@GET
	@Path("/destaques")
	public Destaques.NoPainel destaques() {
		return destaques.noPainel();
	}

	/** {"selecao": ["projeto:revi", "github:Cinema-API"]}; {"selecao": null} volta ao padrão. */
	@PUT
	@Path("/destaques")
	@Consumes(MediaType.APPLICATION_JSON)
	public Selecao escolherDestaques(Selecao corpo) {
		return new Selecao(destaques.escolher(corpo == null ? null : corpo.selecao()));
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

	@PUT
	@Path("/mensagens/{id}/respondida")
	@Consumes(MediaType.APPLICATION_JSON)
	public Response marcarRespondida(@PathParam("id") String id, Respondida corpo) {
		return caixa.marcarRespondida(id, corpo == null || corpo.respondida())
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
