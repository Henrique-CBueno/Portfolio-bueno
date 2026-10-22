package com.henriquebueno.api.coleta;

import org.jboss.logging.Logger;

import com.henriquebueno.api.fontes.Conjunto;
import com.henriquebueno.api.snapshot.Estado;

import io.quarkus.scheduler.Scheduled;
import io.quarkus.scheduler.Scheduled.ConcurrentExecution;
import jakarta.enterprise.context.ApplicationScoped;

/**
 * Lê as fontes automáticas no ritmo de cada uma. Se uma falha, só aparece no log: o snapshot
 * continua com o último valor que deu certo e a próxima rodada tenta de novo.
 */
@ApplicationScoped
public class Coletor {

	private static final Logger log = Logger.getLogger(Coletor.class);

	private final Conjunto fontes;
	private final Estado estado;

	Coletor(Conjunto fontes, Estado estado) {
		this.fontes = fontes;
		this.estado = estado;
	}

	@Scheduled(every = "${portfolio.youtube.intervalo}", concurrentExecution = ConcurrentExecution.SKIP)
	void lerContagens() {
		for (var fonte : fontes.contagens()) {
			tentar("contagem " + fonte.rede().chave(), () -> estado.atualizarContagem(fonte.ler()));
		}
	}

	@Scheduled(every = "${portfolio.github.intervalo}", concurrentExecution = ConcurrentExecution.SKIP)
	void lerRepositorios() {
		tentar("repositórios", () -> estado.atualizarRepositorios(fontes.repositorios().fixados()));
	}

	private static void tentar(String oque, Runnable tarefa) {
		try {
			tarefa.run();
		} catch (RuntimeException e) {
			log.warnf("Leitura de %s falhou: %s", oque, e.getMessage());
		}
	}
}
