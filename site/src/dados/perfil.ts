import type { Rede } from '../lib/tipos';

export const perfil = {
	nome: 'Henrique Bueno',
	papel: 'Desenvolvedor backend',
	handle: 'bueno_dev',
	local: 'Brasil',
	/** Primeiro emprego na área; os anos de experiência saem daqui no build. */
	inicioCarreira: '2025-04',
	projetosEntregues: 20,
	email: 'contato@henriquebueno.com',
};

export const redes: Record<Rede, { nome: string; url: string; usuario: string; unidade?: string }> = {
	instagram: { nome: 'Instagram', url: 'https://www.instagram.com/bueno_dev/', usuario: '@bueno_dev', unidade: 'seguidores' },
	tiktok: { nome: 'TikTok', url: 'https://www.tiktok.com/@bueno_dev0', usuario: '@bueno_dev0', unidade: 'seguidores' },
	youtube: { nome: 'YouTube', url: 'https://www.youtube.com/@bueno_dev', usuario: '@bueno_dev', unidade: 'inscritos' },
	github: { nome: 'GitHub', url: 'https://github.com/Henrique-CBueno', usuario: 'Henrique-CBueno' },
	linkedin: { nome: 'LinkedIn', url: 'https://www.linkedin.com/in/henrique-cbueno', usuario: 'henrique-cbueno' },
};

export const idiomas = ['português · nativo', 'inglês · avançado', 'alemão · básico'];
