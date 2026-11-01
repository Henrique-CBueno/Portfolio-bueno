import { render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { Painel } from './Painel';
import { ehAdmin, entrar, usuarioLogado } from '../services/autenticacao';
import { listarMensagens } from '../services/painel';

// login (Keycloak) e API do painel simulados: cada teste escolhe se entrou e com qual papel
vi.mock('../services/autenticacao', () => ({ entrar: vi.fn(), ehAdmin: vi.fn(), usuarioLogado: vi.fn(), sair: vi.fn() }));
vi.mock('../services/painel', () => ({
	listarMensagens: vi.fn(),
	marcarMensagem: vi.fn(),
	apagarMensagem: vi.fn(),
	buscarDestaques: vi.fn(),
	salvarDestaques: vi.fn(),
	listarContagens: vi.fn(),
	salvarContagem: vi.fn(),
	Recusado: class extends Error {},
}));

const servicos = await import('../services/painel');

describe('painel /admin', () => {
	beforeEach(() => {
		vi.mocked(entrar).mockReset();
		vi.mocked(ehAdmin).mockReset();
		vi.mocked(usuarioLogado).mockReset();
		vi.mocked(listarMensagens).mockReset().mockResolvedValue([]);
		vi.mocked(servicos.buscarDestaques).mockReset().mockResolvedValue({ selecao: null, repositorios: [] });
		vi.mocked(servicos.listarContagens).mockReset().mockResolvedValue([]);
	});

	/** Nenhuma chamada à API do painel aconteceu. */
	const nadaPedido = () => {
		expect(listarMensagens).not.toHaveBeenCalled();
		expect(servicos.buscarDestaques).not.toHaveBeenCalled();
		expect(servicos.listarContagens).not.toHaveBeenCalled();
	};

	it('enquanto o login não termina, não mostra nada do painel', () => {
		vi.mocked(entrar).mockReturnValue(new Promise(() => {}));
		render(<Painel />);

		expect(screen.getByText('entrando…')).toBeInTheDocument();
		expect(screen.queryByRole('heading', { name: /Mensagens/ })).not.toBeInTheDocument();
		nadaPedido();
	});

	it('com o login fora do ar, avisa e não mostra nem pede dado nenhum', async () => {
		vi.mocked(entrar).mockRejectedValue(new Error('Keycloak fora do ar'));
		render(<Painel />);

		expect(await screen.findByText('Não deu pra carregar o login')).toBeInTheDocument();
		expect(screen.queryByRole('heading', { name: /Mensagens/ })).not.toBeInTheDocument();
		nadaPedido();
	});

	it('logado sem o papel "admin": bloqueado, sem mensagens nem destaques', async () => {
		vi.mocked(entrar).mockResolvedValue(true);
		vi.mocked(usuarioLogado).mockReturnValue('visitante');
		vi.mocked(ehAdmin).mockReturnValue(false);
		render(<Painel />);

		expect(await screen.findByText(/não tem o papel "admin"/)).toBeInTheDocument();
		expect(screen.queryByRole('heading', { name: /Mensagens/ })).not.toBeInTheDocument();
		nadaPedido();
	});

	it('com o papel "admin", mostra mensagens, destaques e números', async () => {
		vi.mocked(entrar).mockResolvedValue(true);
		vi.mocked(usuarioLogado).mockReturnValue('henrique');
		vi.mocked(ehAdmin).mockReturnValue(true);
		render(<Painel />);

		expect(await screen.findByRole('heading', { name: /Mensagens/ })).toBeInTheDocument();
		expect(screen.getByRole('heading', { name: /Destaques na home/ })).toBeInTheDocument();
		expect(screen.getByRole('heading', { name: /Números/ })).toBeInTheDocument();
		expect(screen.getByText('henrique')).toBeInTheDocument();
		await waitFor(() => expect(listarMensagens).toHaveBeenCalled());
		expect(await screen.findByText(/Nenhuma mensagem ainda/)).toBeInTheDocument();
	});
});
