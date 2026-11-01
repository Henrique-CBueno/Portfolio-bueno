package com.henriquebueno.api.rebuild;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.atomic.AtomicBoolean;

import org.jboss.logging.Logger;

import com.henriquebueno.api.PortfolioConfig;
import com.henriquebueno.api.snapshot.Eventos;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.enterprise.event.Observes;

/**
 * Roda o comando que reconstrói o site (REBUILD_COMANDO) quando os vídeos, os repositórios fixados ou o painel mudam alguma coisa.
 * Pedidos que chegam durante um rebuild viram um único rebuild logo depois.
 */
@ApplicationScoped
public class Rebuild {

	private static final Logger log = Logger.getLogger(Rebuild.class);
	private static final long LIMITE_MINUTOS = 10;

	private final String comando;
	private final Path registro;
	private final AtomicBoolean rodando = new AtomicBoolean();
	private final AtomicBoolean pendente = new AtomicBoolean();

	Rebuild(PortfolioConfig config) {
		this.comando = config.rebuild().comando().filter(c -> !c.isBlank()).orElse(null);
		this.registro = config.dados().resolve("rebuild.log");
	}

	/** Reel novo, apagado ou editado no Instagram: o site precisa de um build novo. */
	void videosMudaram(@Observes Eventos.VideosMudaram e) {
		pedir();
	}

	/** Repositório fixado, desafixado ou com descrição nova no GitHub: o HTML do build também precisa mudar. */
	void repositoriosMudaram(@Observes Eventos.RepositoriosMudaram e) {
		pedir();
	}

	public void pedir() {
		if (comando == null) {
			log.info("Conteúdo mudou; REBUILD_COMANDO não definido, nada a fazer");
			return;
		}
		pendente.set(true);
		if (rodando.compareAndSet(false, true)) new Thread(this::rodarEnquantoPendente, "rebuild").start();
	}

	private void rodarEnquantoPendente() {
		try {
			while (pendente.getAndSet(false)) rodar();
		} finally {
			rodando.set(false);
		}
	}

	private void rodar() {
		log.infof("Rebuild do site: %s", comando);
		try {
			Files.createDirectories(registro.getParent());
			// a saída vai pra dados/rebuild.log (e não pra um pipe) pra o timeout funcionar mesmo se o comando travar
			var processo = new ProcessBuilder("sh", "-c", comando).redirectErrorStream(true).redirectOutput(registro.toFile()).start();
			if (!processo.waitFor(LIMITE_MINUTOS, TimeUnit.MINUTES)) {
				processo.destroyForcibly();
				log.warnf("Rebuild passou de %d min e foi interrompido", LIMITE_MINUTOS);
			} else if (processo.exitValue() == 0) {
				log.info("Rebuild terminou");
			} else {
				log.warnf("Rebuild saiu com %d; detalhes em %s", processo.exitValue(), registro);
			}
		} catch (IOException e) {
			log.warnf("Rebuild não rodou: %s", e);
		} catch (InterruptedException e) {
			Thread.currentThread().interrupt();
		}
	}
}
