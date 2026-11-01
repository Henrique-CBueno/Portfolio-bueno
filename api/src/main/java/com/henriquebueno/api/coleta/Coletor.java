package com.henriquebueno.api.coleta;

import java.util.Map;
import java.util.Objects;
import java.util.concurrent.ConcurrentHashMap;

import org.jboss.logging.Logger;

import com.henriquebueno.api.fontes.Conjunto;
import com.henriquebueno.api.snapshot.Estado;
import com.henriquebueno.api.videos.Reels;

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
	private final Reels reels;
	private final Map<String, String> ultimosErros = new ConcurrentHashMap<>();

	Coletor(Conjunto fontes, Estado estado, Reels reels) {
		this.fontes = fontes;
		this.estado = estado;
		this.reels = reels;
	}

	@Scheduled(every = "${portfolio.youtube.intervalo}", concurrentExecution = ConcurrentExecution.SKIP)
	void lerContagens() {
		for (var fonte : fontes.contagens()) {
			tentar("contagem " + fonte.rede().chave(), () -> estado.atualizarContagem(fonte.ler()));
		}
	}

	/** Seguidores e Reels do Instagram, no ritmo que a API dele aguenta. */
	@Scheduled(every = "${portfolio.instagram.intervalo}", concurrentExecution = ConcurrentExecution.SKIP)
	void lerInstagram() {
		fontes.instagram().ifPresent(instagram -> {
			tentar("contagem instagram", () -> estado.atualizarContagem(instagram.ler()));
			tentar("vídeos do instagram", () -> reels.sincronizar(instagram.recentes()));
		});
	}

	@Scheduled(every = "24h", delayed = "1h", concurrentExecution = ConcurrentExecution.SKIP)
	void renovarTokenDoInstagram() {
		fontes.instagram().ifPresent(instagram -> tentar("renovação do token do instagram", instagram::renovarToken));
	}

	@Scheduled(every = "${portfolio.github.intervalo}", concurrentExecution = ConcurrentExecution.SKIP)
	void lerRepositorios() {
		tentar("repositórios", () -> estado.atualizarRepositorios(fontes.repositorios().fixados()));
	}

	/** Erro repetido a cada rodada (ex.: falta de permissão) só aparece uma vez no log, até mudar ou a leitura voltar. */
	private void tentar(String oque, Runnable tarefa) {
		try {
			tarefa.run();
			if (ultimosErros.remove(oque) != null) log.infof("Leitura de %s voltou a funcionar", oque);
		} catch (RuntimeException e) {
			if (!Objects.equals(ultimosErros.put(oque, e.getMessage()), e.getMessage())) log.warnf("Leitura de %s falhou: %s", oque, e.getMessage());
		}
	}
}
