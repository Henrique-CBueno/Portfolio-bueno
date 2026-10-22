package com.henriquebueno.api.snapshot;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardCopyOption;
import java.time.Clock;
import java.util.List;
import java.util.function.Consumer;
import java.util.function.UnaryOperator;

import org.jboss.logging.Logger;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.henriquebueno.api.PortfolioConfig;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.enterprise.event.Event;
import jakarta.inject.Inject;

/**
 * O último snapshot conhecido. Sobrevive a reinícios (dados/snapshot.json) e dispara um evento
 * quando as contagens ou a lista de vídeos mudam.
 */
@ApplicationScoped
public class Estado {

	private static final Logger log = Logger.getLogger(Estado.class);

	private final Path arquivo;
	private final ObjectMapper json;
	private final Clock relogio;
	private final Consumer<Object> publicar;
	private Snapshot atual;

	@Inject
	public Estado(PortfolioConfig config, ObjectMapper json, Event<Object> eventos) {
		this(config.dados(), json, Clock.systemUTC(), eventos::fire);
	}

	Estado(Path dados, ObjectMapper json, Clock relogio, Consumer<Object> publicar) {
		this.arquivo = dados.resolve("snapshot.json");
		this.json = json;
		this.relogio = relogio;
		this.publicar = publicar;
		this.atual = carregar();
	}

	public synchronized Snapshot atual() {
		return atual;
	}

	public void atualizarContagem(Contagem nova) {
		Snapshot antes, depois;
		synchronized (this) {
			antes = atual;
			depois = trocar(s -> s.comContagem(nova, relogio.instant()));
		}
		if (!antes.contagens().equals(depois.contagens())) publicar.accept(new Eventos.ContagensMudaram(depois.contagens()));
	}

	public void atualizarVideos(List<Video> novos) {
		Snapshot antes, depois;
		synchronized (this) {
			antes = atual;
			depois = trocar(s -> s.comVideos(novos, relogio.instant()));
		}
		if (!antes.videos().equals(depois.videos())) publicar.accept(new Eventos.VideosMudaram(antes.videos(), depois.videos()));
	}

	public synchronized void atualizarRepositorios(List<Repositorio> novos) {
		trocar(s -> s.comRepositorios(novos, relogio.instant()));
	}

	private Snapshot trocar(UnaryOperator<Snapshot> mudanca) {
		atual = mudanca.apply(atual);
		salvar(atual);
		return atual;
	}

	private Snapshot carregar() {
		if (!Files.exists(arquivo)) return Snapshot.vazio();
		try {
			return json.readValue(arquivo.toFile(), Snapshot.class);
		} catch (IOException e) {
			log.warnf(e, "Não consegui ler %s; começando vazio", arquivo);
			return Snapshot.vazio();
		}
	}

	private void salvar(Snapshot snapshot) {
		try {
			Files.createDirectories(arquivo.getParent());
			var temporario = arquivo.resolveSibling("snapshot.json.tmp");
			json.writeValue(temporario.toFile(), snapshot);
			Files.move(temporario, arquivo, StandardCopyOption.REPLACE_EXISTING, StandardCopyOption.ATOMIC_MOVE);
		} catch (IOException e) {
			log.warnf(e, "Não consegui gravar %s", arquivo);
		}
	}
}
