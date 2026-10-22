package com.henriquebueno.api.fontes;

import java.util.List;

import com.henriquebueno.api.snapshot.Repositorio;

/**
 * Sem GITHUB_TOKEN, a API usa a última lista de repositórios fixados copiada à mão (dados reais).
 * Números nunca têm exemplo: sem fonte, o site mostra só o @.
 */
public final class Exemplo {

	private Exemplo() {
	}

	public static class Repositorios implements Fontes.DeRepositorios {
		@Override
		public List<Repositorio> fixados() {
			var base = "https://github.com/Henrique-CBueno/";
			return List.of(
					new Repositorio("sharding-orchestrator", "Sharding sobre PostgreSQL com consistent hashing e virtual nodes; entrada e saída de shards e rebalanceamento acionados via CDC (Debezium + Kafka), sem coordenador central.", List.of("Java", "PL/pgSQL"), base + "sharding-orchestrator"),
					new Repositorio("persistencia-poliglota", "Ingestão e análise de feedbacks de clientes com classificação de tópicos e sentimento e atualização em tempo real por SSE.", List.of("Java", "JavaScript"), base + "persistencia-poliglota"),
					new Repositorio("micro-tickets-cdc", null, List.of("Java", "Dockerfile"), base + "micro-tickets-cdc"),
					new Repositorio("Cinema-API", "Plataforma de reservas de ingressos que evita overbooking em alta concorrência, com arquitetura orientada a eventos, CQRS, lock distribuído de assentos no Redis e integrações AWS.", List.of("Java", "HCL"), base + "Cinema-API"),
					new Repositorio("Microsservi-os-com-envio-de-sms", null, List.of("Java", "Dockerfile"), base + "Microsservi-os-com-envio-de-sms"),
					new Repositorio("ms-kafka", "Pedidos em microsserviços com Kafka e Spring Boot, da criação ao faturamento, envio e rastreamento.", List.of("Java"), base + "ms-kafka"));
		}
	}
}
