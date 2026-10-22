package com.henriquebueno.api.admin;

import java.io.IOException;
import java.nio.file.Files;
import java.util.List;
import java.util.Map;

import org.jboss.resteasy.reactive.RestForm;
import org.jboss.resteasy.reactive.multipart.FileUpload;
import org.jboss.resteasy.reactive.server.ServerExceptionMapper;

import com.henriquebueno.api.snapshot.Contagem;
import com.henriquebueno.api.snapshot.Estado;
import com.henriquebueno.api.snapshot.Rede;
import com.henriquebueno.api.snapshot.Video;

import jakarta.annotation.security.RolesAllowed;
import jakarta.ws.rs.Consumes;
import jakarta.ws.rs.DELETE;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.POST;
import jakarta.ws.rs.PUT;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.PathParam;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;

/** Rotas do painel /admin do site. Só com token do Keycloak e o papel "admin". */
@Path("/admin-api")
@RolesAllowed("admin")
@Produces(MediaType.APPLICATION_JSON)
public class AdminRecurso {

	public record NovoValor(Long valor) {
	}

	private final Catalogo catalogo;
	private final Estado estado;

	AdminRecurso(Catalogo catalogo, Estado estado) {
		this.catalogo = catalogo;
		this.estado = estado;
	}

	@GET
	@Path("/videos")
	public List<Video> videos() {
		return estado.atual().videos();
	}

	@GET
	@Path("/categorias")
	public List<String> categorias() {
		return catalogo.categorias();
	}

	@GET
	@Path("/contagens")
	public List<Contagem> contagens() {
		return estado.atual().contagens();
	}

	@POST
	@Path("/videos")
	@Consumes(MediaType.MULTIPART_FORM_DATA)
	public Response criar(@RestForm String titulo, @RestForm String categoria, @RestForm String publicadoEm,
			@RestForm String instagram, @RestForm String tiktok, @RestForm String youtube, @RestForm("capa") FileUpload capa) {
		var video = catalogo.criar(new Catalogo.Dados(titulo, categoria, publicadoEm, instagram, tiktok, youtube), bytes(capa));
		return Response.status(Response.Status.CREATED).entity(video).build();
	}

	@PUT
	@Path("/videos/{id}")
	@Consumes(MediaType.MULTIPART_FORM_DATA)
	public Response atualizar(@PathParam("id") String id, @RestForm String titulo, @RestForm String categoria, @RestForm String publicadoEm,
			@RestForm String instagram, @RestForm String tiktok, @RestForm String youtube, @RestForm("capa") FileUpload capa) {
		return catalogo.atualizar(id, new Catalogo.Dados(titulo, categoria, publicadoEm, instagram, tiktok, youtube), bytes(capa))
				.map(v -> Response.ok(v).build())
				.orElse(Response.status(Response.Status.NOT_FOUND).build());
	}

	@DELETE
	@Path("/videos/{id}")
	public Response apagar(@PathParam("id") String id) {
		return catalogo.apagar(id) ? Response.noContent().build() : Response.status(Response.Status.NOT_FOUND).build();
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
		return Response.ok(catalogo.contagem(r, corpo == null ? null : corpo.valor())).build();
	}

	@ServerExceptionMapper
	Response invalido(Invalido e) {
		return Response.status(Response.Status.BAD_REQUEST).type(MediaType.APPLICATION_JSON).entity(Map.of("ok", false, "erros", e.erros)).build();
	}

	private static byte[] bytes(FileUpload upload) {
		if (upload == null || upload.uploadedFile() == null || upload.size() == 0) return null;
		try {
			return Files.readAllBytes(upload.uploadedFile());
		} catch (IOException e) {
			throw new IllegalStateException(e);
		}
	}
}
