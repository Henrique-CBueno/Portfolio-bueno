import { render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { Painel } from './Painel';
import { chamar, entrar, keycloak } from './api';

// o login (Keycloak) é simulado: cada teste escolhe se entrou e com qual papel
vi.mock('./api', () => ({
	entrar: vi.fn(),
	chamar: vi.fn(),
	keycloak: { tokenParsed: undefined as Record<string, unknown> | undefined, hasRealmRole: vi.fn(), logout: vi.fn() },
	dataBR: new Intl.DateTimeFormat('pt-BR'),
}));

const json = (corpo: unknown) => new Response(JSON.stringify(corpo), { status: 200, headers: { 'Content-Type': 'application/json' } });

describe('painel /admin', () => {
	beforeEach(() => {
		vi.mocked(entrar).mockReset();
		vi.mocked(chamar).mockReset().mockImplementation(async (caminho: string) => {
			if (caminho === '/mensagens') return json([]);
			if (caminho === '/destaques') return json({ selecao: null, repositorios: [] });
			return json([]);
		});
		vi.mocked(keycloak.hasRealmRole).mockReset();
		keycloak.tokenParsed = undefined;
	});

	it('enquanto o login não termina, não mostra nada do painel', () => {
		vi.mocked(entrar).mockReturnValue(new Promise(() => {}));
		render(<Painel />);

		expect(screen.getByText('entrando…')).toBeInTheDocument();
		expect(screen.queryByRole('heading', { name: /Mensagens/ })).not.toBeInTheDocument();
		expect(chamar).not.toHaveBeenCalled();
	});

	it('com o login fora do ar, avisa e não mostra nem pede dado nenhum', async () => {
		vi.mocked(entrar).mockRejectedValue(new Error('Keycloak fora do ar'));
		render(<Painel />);

		expect(await screen.findByText('Não deu pra carregar o login')).toBeInTheDocument();
		expect(screen.queryByRole('heading', { name: /Mensagens/ })).not.toBeInTheDocument();
		expect(chamar).not.toHaveBeenCalled();
	});

	it('logado sem o papel "admin": bloqueado, sem mensagens nem destaques', async () => {
		vi.mocked(entrar).mockResolvedValue(true);
		keycloak.tokenParsed = { preferred_username: 'visitante' };
		vi.mocked(keycloak.hasRealmRole).mockReturnValue(false);
		render(<Painel />);

		expect(await screen.findByText(/não tem o papel "admin"/)).toBeInTheDocument();
		expect(keycloak.hasRealmRole).toHaveBeenCalledWith('admin');
		expect(screen.queryByRole('heading', { name: /Mensagens/ })).not.toBeInTheDocument();
		expect(chamar).not.toHaveBeenCalled();
	});

	it('com o papel "admin", mostra mensagens, destaques e números', async () => {
		vi.mocked(entrar).mockResolvedValue(true);
		keycloak.tokenParsed = { preferred_username: 'henrique' };
		vi.mocked(keycloak.hasRealmRole).mockReturnValue(true);
		render(<Painel />);

		expect(await screen.findByRole('heading', { name: /Mensagens/ })).toBeInTheDocument();
		expect(screen.getByRole('heading', { name: /Destaques na home/ })).toBeInTheDocument();
		expect(screen.getByRole('heading', { name: /Números/ })).toBeInTheDocument();
		expect(screen.getByText('henrique')).toBeInTheDocument();
		await waitFor(() => expect(chamar).toHaveBeenCalledWith('/mensagens'));
		expect(await screen.findByText(/Nenhuma mensagem ainda/)).toBeInTheDocument();
	});
});
