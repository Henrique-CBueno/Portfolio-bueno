import type { Destaque, Repositorio } from '../lib/tipos';
import { imagem } from '../lib/imagem';
import gioiaPicture from '../assets/projetos/gioia.jpg?w=600;1200&format=webp&as=picture';
import negociadfPicture from '../assets/projetos/negociadf.jpg?w=600;1200&format=webp&as=picture';
import reviPicture from '../assets/projetos/revi.jpg?w=600;1200&format=webp&as=picture';

/** Curados à mão: só projetos em produção. */
export const destaques: Destaque[] = [
	{
		titulo: 'Revi',
		descricao: 'Fotografe o caderno e estude o que está nele: a IA reconhece a disciplina e o assunto, arquiva a foto e transforma o material em flash cards com repetição espaçada, resumo, simulado e mapa mental, que também podem ser ouvidos em voz alta. Backend em Spring Boot com LangChain4j, fotos no S3, PostgreSQL e frontend em React.',
		tags: [{ nome: 'Spring Boot', cor: 'verde' }, { nome: 'LangChain4j', cor: 'roxo' }, { nome: 'React', cor: 'azul' }, { nome: 'PostgreSQL', cor: 'azul' }, { nome: 'S3', cor: 'neutro' }],
		endereco: 'revi-jovi.vercel.app',
		print: { imagem: imagem(reviPicture), alt: 'Página inicial do Revi: "Fotografe o caderno. Estude o que está nele." com pastas de disciplinas' },
		links: [{ rotulo: 'ver site', href: 'https://revi-jovi.vercel.app/', icone: 'externo' }],
		nota: 'projeto em equipe',
		largo: true,
	},
	{
		titulo: 'Gioia Investimentos',
		descricao: 'Plataforma de consultoria macroeconômica, com backend em Spring Boot, frontend em React e deploy automatizado na AWS (S3, SNS, SQS e CI/CD), feita pra entregar análises financeiras com confiabilidade e escala.',
		tags: [{ nome: 'Java', cor: 'amarelo' }, { nome: 'Spring Boot', cor: 'verde' }, { nome: 'React', cor: 'azul' }, { nome: 'AWS', cor: 'neutro' }],
		endereco: 'gioiainvestimentos.com',
		print: { imagem: imagem(gioiaPicture), alt: 'Página inicial da Gioia Investimentos' },
		links: [{ rotulo: 'ver site', href: 'https://gioiainvestimentos.com/', icone: 'externo' }],
	},
	{
		titulo: 'NegociaDF',
		descricao: 'Plataforma do GDF pra negociar débitos da Dívida Ativa do Distrito Federal. Atuei em funcionalidades e melhorias de um sistema de grande escala, em fluxos sensíveis ao negócio.',
		tags: [{ nome: 'Java', cor: 'amarelo' }, { nome: 'Liferay', cor: 'roxo' }, { nome: 'React', cor: 'azul' }],
		endereco: 'sisprot.pg.df.gov.br',
		print: { imagem: imagem(negociadfPicture), alt: 'Página inicial do Negocia-DF' },
		links: [{ rotulo: 'ver sistema', href: 'https://sisprot.pg.df.gov.br/', icone: 'externo' }],
		nota: 'participação',
	},
];

/**
 * Repositórios fixados no perfil, usados quando o build roda sem a API (a API lê do GitHub). Os que já estão em destaque ficam de fora.
 */
export const fixados: Repositorio[] = [
	{ nome: 'sharding-orchestrator', linguagens: ['Java', 'PL/pgSQL'], url: 'https://github.com/Henrique-CBueno/sharding-orchestrator', descricao: 'Sharding sobre PostgreSQL com consistent hashing e virtual nodes; entrada e saída de shards e rebalanceamento acionados via CDC (Debezium + Kafka), sem coordenador central.' },
	{ nome: 'persistencia-poliglota', linguagens: ['Java', 'JavaScript'], url: 'https://github.com/Henrique-CBueno/persistencia-poliglota', descricao: 'Ingestão e análise de feedbacks de clientes com classificação de tópicos e sentimento e atualização em tempo real por SSE.' },
	{ nome: 'micro-tickets-cdc', linguagens: ['Java', 'Dockerfile'], url: 'https://github.com/Henrique-CBueno/micro-tickets-cdc' },
	{ nome: 'Cinema-API', linguagens: ['Java', 'HCL'], url: 'https://github.com/Henrique-CBueno/Cinema-API', descricao: 'Plataforma de reservas de ingressos que evita overbooking em alta concorrência, com arquitetura orientada a eventos, CQRS, lock distribuído de assentos no Redis e integrações AWS.' },
	{ nome: 'Microsservi-os-com-envio-de-sms', linguagens: ['Java', 'Dockerfile'], url: 'https://github.com/Henrique-CBueno/Microsservi-os-com-envio-de-sms' },
	{ nome: 'ms-kafka', linguagens: ['Java'], url: 'https://github.com/Henrique-CBueno/ms-kafka', descricao: 'Pedidos em microsserviços com Kafka e Spring Boot, da criação ao faturamento, envio e rastreamento.' },
];
