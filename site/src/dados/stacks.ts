import type { Cor } from '../lib/tipos';

/** Do CV (~/Documentos/profissional/cv/Henrique_Bueno_CV.yaml), em camadas. */
export const camadas: { nome: string; cor: Cor; itens: string[] }[] = [
	{ nome: 'linguagens', cor: 'amarelo', itens: ['Java', 'Python', 'TypeScript'] },
	{ nome: 'backend', cor: 'amarelo', itens: ['Spring Boot', 'Spring Data JPA', 'Spring Security', 'WebFlux', 'REST', 'GraphQL'] },
	{ nome: 'mensageria', cor: 'vermelho', itens: ['Kafka', 'RabbitMQ'] },
	{ nome: 'bancos', cor: 'azul', itens: ['PostgreSQL', 'MongoDB', 'Redis', 'Elasticsearch', 'DynamoDB', 'Neo4j'] },
	{ nome: 'nuvem e devops', cor: 'verde', itens: ['AWS', 'Docker', 'Terraform', 'CI/CD'] },
	{ nome: 'observabilidade', cor: 'roxo', itens: ['Prometheus', 'Grafana', 'OpenTelemetry', 'Micrometer'] },
	{ nome: 'segurança', cor: 'neutro', itens: ['Keycloak', 'OAuth2', 'JWT', '2FA'] },
	{ nome: 'testes', cor: 'neutro', itens: ['JUnit 5', 'Mockito', 'Testcontainers', 'TDD'] },
];

export const arquitetura = ['System Design', 'Sharding', 'Replicação', 'Event-Driven', 'CQRS', 'Event Sourcing', 'Saga', 'Outbox', 'DDD', 'Hexagonal'];

export const ia = ['Claude Code', 'LLM Agents', 'LangChain', 'Agno'];
