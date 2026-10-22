// Painel /admin: login no Keycloak (PKCE) e chamadas às rotas /admin-api da API com o token.
import Keycloak from 'keycloak-js';
import { categoria as infoCategoria } from '../lib/categorias';
import { formatarNumero } from '../lib/formato';
import type { Contagem, Video } from '../lib/tipos';

const api = import.meta.env.PUBLIC_API_URL ?? '';
const keycloak = new Keycloak({
	url: import.meta.env.PUBLIC_KEYCLOAK_URL ?? 'http://localhost:8180',
	realm: import.meta.env.PUBLIC_KEYCLOAK_REALM ?? 'portfolio',
	clientId: import.meta.env.PUBLIC_KEYCLOAK_CLIENT ?? 'portfolio-admin',
});

const $ = <T extends HTMLElement = HTMLElement>(seletor: string) => document.querySelector<T>(seletor)!;
const aviso = $('[data-aviso]');
const form = $<HTMLFormElement>('[data-form]');
const lista = $('[data-lista]');
const estadoForm = $('[data-estado-form]');
const capaInput = $<HTMLInputElement>('[data-capa-input]');
const capaPrevia = $<HTMLImageElement>('[data-capa-previa]');
const capaTexto = $('[data-capa-texto]');
const dicaPadrao = estadoForm.textContent ?? '';
let videos: Video[] = [];
let editando: Video | null = null;

const dataBR = new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'short', year: 'numeric', timeZone: 'America/Sao_Paulo' });
const hoje = () => new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Sao_Paulo' }).format(new Date());

async function chamar(caminho: string, init: RequestInit = {}) {
	await keycloak.updateToken(30);
	const resposta = await fetch(`${api}/admin-api${caminho}`, {
		...init,
		headers: { ...(init.headers ?? {}), Authorization: `Bearer ${keycloak.token}` },
	});
	if (resposta.status === 401) keycloak.login();
	return resposta;
}

function pill(onde: HTMLElement, cor: string, texto: string) {
	onde.innerHTML = '';
	const p = document.createElement('span');
	p.className = `pill ${cor}`;
	p.textContent = texto;
	onde.append(p);
}

/* ---------- formulário de vídeo ---------- */

function limparErros() {
	form.querySelectorAll<HTMLElement>('[data-erro]').forEach((e) => (e.textContent = ''));
	form.querySelectorAll('.erro').forEach((e) => e.classList.remove('erro'));
}

function mostrarErros(erros: Record<string, string>) {
	for (const [campo, mensagem] of Object.entries(erros)) {
		const alvo = form.querySelector<HTMLElement>(`[data-erro="${campo}"]`);
		if (alvo) alvo.textContent = mensagem;
		form.querySelector(`[name="${campo}"]`)?.classList.add('erro');
	}
}

function mostrarCapa(url: string | null) {
	capaPrevia.hidden = !url;
	capaTexto.hidden = !!url;
	if (url) capaPrevia.src = url;
}

function preencher(v: Video | null) {
	editando = v;
	form.reset();
	limparErros();
	const campo = (nome: string) => form.elements.namedItem(nome) as HTMLInputElement;
	campo('titulo').value = v?.titulo ?? '';
	campo('categoria').value = v?.categoria ?? '';
	campo('publicadoEm').value = v ? new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Sao_Paulo' }).format(new Date(v.publicadoEm)) : hoje();
	campo('instagram').value = v?.links?.instagram ?? '';
	campo('tiktok').value = v?.links?.tiktok ?? '';
	campo('youtube').value = v?.links?.youtube ?? '';
	mostrarCapa(v ? `${api}${v.capa}` : null);
	$('[data-titulo-form]').innerHTML = v ? 'Editar <em>vídeo</em>' : 'Novo <em>vídeo</em>';
	$('[data-enviar]').textContent = v ? 'salvar alterações' : 'publicar';
	$('[data-cancelar]').hidden = !v;
	estadoForm.textContent = v ? 'deixe a capa como está ou escolha outra' : dicaPadrao;
	if (v) form.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

capaInput.addEventListener('change', () => {
	const arquivo = capaInput.files?.[0];
	mostrarCapa(arquivo ? URL.createObjectURL(arquivo) : editando ? `${api}${editando.capa}` : null);
});

$('[data-cancelar]').addEventListener('click', () => preencher(null));

form.addEventListener('submit', async (evento) => {
	evento.preventDefault();
	limparErros();
	const botao = $<HTMLButtonElement>('[data-enviar]');
	botao.disabled = true;
	pill(estadoForm, 'amarelo', 'salvando…');
	try {
		const dados = new FormData(form);
		if (!(dados.get('capa') as File)?.size) dados.delete('capa');
		const resposta = editando
			? await chamar(`/videos/${editando.id}`, { method: 'PUT', body: dados })
			: await chamar('/videos', { method: 'POST', body: dados });
		if (resposta.status === 400) {
			mostrarErros((await resposta.json()).erros ?? {});
			pill(estadoForm, 'vermelho', 'confira os campos');
			return;
		}
		if (!resposta.ok) throw new Error(String(resposta.status));
		pill(estadoForm, 'verde', editando ? 'alterações salvas ✓' : 'vídeo publicado ✓');
		preencher(null);
		await carregarVideos();
	} catch {
		pill(estadoForm, 'vermelho', 'não deu pra salvar agora');
	} finally {
		botao.disabled = false;
	}
});

/* ---------- lista ---------- */

function desenharLista() {
	$('[data-total]').textContent = String(videos.length);
	lista.innerHTML = '';
	if (videos.length === 0) {
		lista.innerHTML = '<p class="vazio">nenhum vídeo ainda: o primeiro vai aparecer aqui e no site.</p>';
		return;
	}
	for (const v of videos) {
		const item = document.createElement('article');
		item.className = 'item';
		const cat = infoCategoria(v.categoria);
		item.innerHTML = `
			<img src="${api}${v.capa}" alt="" loading="lazy" />
			<strong></strong>
			<div class="meta">${cat ? `<span class="pill ${cat.cor}">${cat.nome}</span>` : ''}<span>${dataBR.format(new Date(v.publicadoEm))}</span></div>
			<div class="acoes"><button type="button" data-editar>editar</button><button type="button" data-apagar>apagar</button></div>`;
		item.querySelector('strong')!.textContent = v.titulo;
		item.querySelector('[data-editar]')!.addEventListener('click', () => preencher(v));
		const apagar = item.querySelector<HTMLButtonElement>('[data-apagar]')!;
		// apagar em dois toques, sem janela de confirmação do navegador
		apagar.addEventListener('click', async () => {
			if (!apagar.classList.contains('confirmar')) {
				apagar.classList.add('confirmar');
				apagar.textContent = 'confirmar?';
				setTimeout(() => { apagar.classList.remove('confirmar'); apagar.textContent = 'apagar'; }, 3000);
				return;
			}
			apagar.disabled = true;
			const resposta = await chamar(`/videos/${v.id}`, { method: 'DELETE' });
			if (resposta.ok && editando?.id === v.id) preencher(null);
			await carregarVideos();
		});
		lista.append(item);
	}
}

async function carregarVideos() {
	videos = await (await chamar('/videos')).json();
	desenharLista();
}

/* ---------- números ---------- */

const nomesRede: Record<string, string> = { instagram: 'Instagram', tiktok: 'TikTok', youtube: 'YouTube' };

async function carregarNumeros() {
	const contagens: Contagem[] = await (await chamar('/contagens')).json();
	const caixa = $('[data-numeros]');
	caixa.innerHTML = '';
	for (const c of contagens) {
		const bloco = document.createElement('form');
		bloco.className = 'painel';
		if (c.rede === 'youtube') {
			bloco.innerHTML = `<strong>YouTube</strong><small>${c.valor === null ? 'sem YOUTUBE_CHAVE: o site mostra só o @' : `${c.aproximado ? '~' : ''}${formatarNumero(c.valor)} inscritos · lido pela API`}</small>`;
		} else {
			bloco.innerHTML = `
				<strong>${nomesRede[c.rede]}</strong>
				<div class="linha-numero"><input type="number" min="0" inputmode="numeric" placeholder="seguidores" /><button class="botao" type="submit">salvar</button></div>
				<small data-quando></small>`;
			const campo = bloco.querySelector('input')!;
			const quando = bloco.querySelector<HTMLElement>('[data-quando]')!;
			campo.value = c.valor === null ? '' : String(c.valor);
			quando.textContent = c.atualizadoEm ? `atualizado em ${dataBR.format(new Date(c.atualizadoEm))}` : 'sem número: o site mostra só o @';
			bloco.addEventListener('submit', async (e) => {
				e.preventDefault();
				const valor = campo.value.trim() === '' ? null : Number(campo.value);
				const resposta = await chamar(`/contagens/${c.rede}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ valor }) });
				if (resposta.ok) pill(quando, 'verde', 'salvo ✓');
				else pill(quando, 'vermelho', 'não deu pra salvar');
			});
		}
		caixa.append(bloco);
	}
}

/* ---------- início ---------- */

async function iniciar() {
	try {
		await keycloak.init({ onLoad: 'login-required', pkceMethod: 'S256', checkLoginIframe: false });
	} catch {
		aviso.textContent = 'não consegui falar com o login (Keycloak). Tente de novo em instantes.';
		return;
	}
	$('[data-usuario]').textContent = String(keycloak.tokenParsed?.preferred_username ?? '');
	const sair = $<HTMLButtonElement>('[data-sair]');
	sair.hidden = false;
	sair.addEventListener('click', () => keycloak.logout({ redirectUri: `${location.origin}/` }));
	if (!keycloak.hasRealmRole('admin')) {
		aviso.textContent = 'sua conta entrou, mas não tem o papel "admin" no Keycloak.';
		return;
	}

	const categorias: string[] = await (await chamar('/categorias')).json();
	const select = $<HTMLSelectElement>('[data-categorias]');
	for (const c of categorias) select.add(new Option(infoCategoria(c)?.nome ?? c, c));

	preencher(null);
	await Promise.all([carregarVideos(), carregarNumeros()]);
	aviso.hidden = true;
	$('[data-conteudo]').hidden = false;
}

iniciar();
