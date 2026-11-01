import type { Destaque } from '../lib/tipos';
import { imagem } from '../lib/imagem';
import gioiaPicture from '../assets/projetos/gioia.jpg?w=600;1200&format=webp&as=picture';
import negociadfPicture from '../assets/projetos/negociadf.jpg?w=600;1200&format=webp&as=picture';
import reviPicture from '../assets/projetos/revi.jpg?w=600;1200&format=webp&as=picture';

/** Curados à mão: só projetos em produção. Cada um tem página própria em /projetos/<slug>. */
export const destaques: Destaque[] = [
	{
		slug: 'revi',
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
		slug: 'gioia-investimentos',
		titulo: 'Gioia Investimentos',
		descricao: 'Plataforma de consultoria macroeconômica, com backend em Spring Boot, frontend em React e deploy automatizado na AWS (S3, SNS, SQS e CI/CD), feita pra entregar análises financeiras com confiabilidade e escala.',
		tags: [{ nome: 'Java', cor: 'amarelo' }, { nome: 'Spring Boot', cor: 'verde' }, { nome: 'React', cor: 'azul' }, { nome: 'AWS', cor: 'neutro' }],
		endereco: 'gioiainvestimentos.com',
		print: { imagem: imagem(gioiaPicture), alt: 'Página inicial da Gioia Investimentos' },
		links: [{ rotulo: 'ver site', href: 'https://gioiainvestimentos.com/', icone: 'externo' }],
	},
	{
		slug: 'negociadf',
		titulo: 'NegociaDF',
		descricao: 'Plataforma do GDF pra negociar débitos da Dívida Ativa do Distrito Federal. Atuei em funcionalidades e melhorias de um sistema de grande escala, em fluxos sensíveis ao negócio.',
		tags: [{ nome: 'Java', cor: 'amarelo' }, { nome: 'Liferay', cor: 'roxo' }, { nome: 'React', cor: 'azul' }],
		endereco: 'sisprot.pg.df.gov.br',
		print: { imagem: imagem(negociadfPicture), alt: 'Página inicial do Negocia-DF' },
		links: [{ rotulo: 'ver sistema', href: 'https://sisprot.pg.df.gov.br/', icone: 'externo' }],
		nota: 'participação',
	},
];

