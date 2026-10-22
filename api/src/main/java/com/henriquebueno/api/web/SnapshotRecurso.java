package com.henriquebueno.api.web;

import com.henriquebueno.api.snapshot.Estado;
import com.henriquebueno.api.snapshot.Snapshot;

import jakarta.ws.rs.GET;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.MediaType;

@Path("/snapshot")
public class SnapshotRecurso {

	private final Estado estado;

	SnapshotRecurso(Estado estado) {
		this.estado = estado;
	}

	/** Lido pelo build do site: últimos vídeos, contagens e repositórios fixados. */
	@GET
	@Produces(MediaType.APPLICATION_JSON)
	public Snapshot snapshot() {
		return estado.atual();
	}
}
