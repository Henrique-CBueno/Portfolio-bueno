import type { Premio } from '../lib/tipos';
import { imagem } from '../lib/imagem';
import tresCoracoesPicture from '../assets/premios/tres-coracoes.jpg?w=400;700&format=webp&as=picture';

/** Prêmio com foto vira card grande; sem foto, vira faixa. */
export const premios: Premio[] = [
	{
		evento: 'Hackathon AWS × Três Corações × FIAP',
		colocacao: '1º lugar',
		quando: 'out 2026 · Cafeína Week',
		projeto: {
			nome: 'Cora GPS',
			descricao: 'em vez do PDF de indicadores que o vendedor da 3corações recebe todo dia, um roteiro que diz o que levar pra cada cliente da rota, quanto e a chance de aceite.',
		},
		contexto: { texto: 'desafio CORA Vendas · nota', destaque: '4,62', depois: 'de 5' },
		organizadores: [{ nome: 'AWS', cor: 'verde' }, { nome: 'Três Corações', cor: 'vermelho' }, { nome: 'FIAP', cor: 'roxo' }],
		foto: { imagem: imagem(tresCoracoesPicture), alt: 'Henrique e o time no palco segurando os shapes de skate do prêmio, com o telão anunciando o Grupo 4 em primeiro lugar' },
	},
	{
		evento: 'Hackathon CREA JR-DF',
		colocacao: '1º lugar',
		onde: 'Distrito Federal',
		projeto: { descricao: 'Projeto pra conectar estudantes das áreas do CREA ao mercado de trabalho.' },
		organizadores: [{ nome: 'CREA JR-DF', cor: 'azul' }],
	},
];
