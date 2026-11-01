import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { Contato } from './Contato';

const API = 'http://api.teste';

/** Resposta falsa da API (o fetch é trocado em cada teste). */
const resposta = (status: number, corpo: unknown = {}) => new Response(JSON.stringify(corpo), { status, headers: { 'Content-Type': 'application/json' } });

function montar() {
	const usuario = userEvent.setup();
	render(<Contato />);
	return {
		usuario,
		nome: screen.getByLabelText('nome'),
		email: screen.getByLabelText('e-mail'),
		mensagem: screen.getByLabelText('mensagem'),
		enviar: screen.getByRole('button', { name: /enviar mensagem/ }),
		aviso: (campo: string) => document.getElementById(`aviso-${campo}`),
	};
}

async function preencherCerto(f: ReturnType<typeof montar>) {
	await f.usuario.type(f.nome, 'Ana');
	await f.usuario.type(f.email, 'ana@exemplo.com');
	await f.usuario.type(f.mensagem, 'Quero conversar sobre uma parceria.');
}

describe('formulário de contato', () => {
	let fetch: ReturnType<typeof vi.fn>;

	beforeEach(() => {
		vi.stubEnv('PUBLIC_API_URL', API);
		fetch = vi.fn();
		vi.stubGlobal('fetch', fetch);
	});

	it('enviar vazio mostra a mensagem de cada campo, foca o primeiro e não chama a API', async () => {
		const f = montar();
		await f.usuario.click(f.enviar);

		expect(f.aviso('nome')).toHaveTextContent('conta como posso te chamar');
		expect(f.aviso('email')).toHaveTextContent('falta o e-mail');
		expect(f.aviso('mensagem')).toHaveTextContent('falta a mensagem');
		expect(f.nome).toHaveAttribute('aria-invalid', 'true');
		expect(f.nome).toHaveAccessibleDescription('conta como posso te chamar');
		expect(f.nome).toHaveFocus();
		expect(screen.getByText('confira os campos destacados')).toBeInTheDocument();
		expect(fetch).not.toHaveBeenCalled();
	});

	it('avisa ao sair do campo e o aviso some quando a pessoa corrige', async () => {
		const f = montar();
		await f.usuario.type(f.email, 'ana@exemplo');
		await f.usuario.tab();
		expect(f.aviso('email')).toHaveTextContent('e-mail inválido');

		await f.usuario.type(f.email, '.com');
		expect(f.aviso('email')).toBeNull();
		expect(f.email).not.toHaveAttribute('aria-invalid');
	});

	it('mostra quantos caracteres faltam e, ao sair, que o mínimo é 20', async () => {
		const f = montar();
		await f.usuario.type(f.mensagem, 'oi tudo bem');
		expect(f.aviso('mensagem')).toHaveTextContent('faltam 9 caracteres (mínimo 20)');

		await f.usuario.tab();
		expect(f.aviso('mensagem')).toHaveTextContent('mensagem com no mínimo 20 caracteres');
	});

	it('envia os campos sem espaço nas pontas, mostra o sucesso e limpa o formulário', async () => {
		fetch.mockResolvedValue(resposta(202, { ok: true }));
		const f = montar();
		await f.usuario.type(f.nome, '  Ana  ');
		await f.usuario.type(f.email, 'ana@exemplo.com');
		await f.usuario.type(f.mensagem, 'Quero conversar sobre uma parceria.');
		await f.usuario.click(f.enviar);

		expect(await screen.findByText(/mensagem enviada ✓/)).toBeInTheDocument();
		expect(fetch).toHaveBeenCalledTimes(1);
		const [url, init] = fetch.mock.calls[0];
		expect(String(url)).toBe(`${API}/contato`);
		expect(JSON.parse(init.body)).toEqual({ nome: 'Ana', email: 'ana@exemplo.com', assunto: '', mensagem: 'Quero conversar sobre uma parceria.' });
		expect(f.nome).toHaveValue('');
		expect(f.mensagem).toHaveValue('');
	});

	it('o erro que a API devolver aparece embaixo do campo certo', async () => {
		fetch.mockResolvedValue(resposta(400, { ok: false, erros: { email: 'e-mail inválido' } }));
		const f = montar();
		await preencherCerto(f);
		await f.usuario.click(f.enviar);

		await waitFor(() => expect(f.aviso('email')).toHaveTextContent('e-mail inválido'));
		expect(f.email).toHaveFocus();
	});

	it('enquanto envia, o botão trava com "enviando…" e clique duplo manda uma vez só', async () => {
		let responder!: (r: Response) => void;
		fetch.mockReturnValue(new Promise<Response>((r) => { responder = r; }));
		const f = montar();
		await preencherCerto(f);
		await f.usuario.dblClick(f.enviar);
		await f.usuario.click(f.enviar);

		const botao = screen.getByRole('button', { name: /enviando/ });
		expect(botao).toBeDisabled();
		expect(fetch).toHaveBeenCalledTimes(1);

		responder(resposta(202, { ok: true }));
		expect(await screen.findByText(/mensagem enviada ✓/)).toBeInTheDocument();
		expect(screen.getByRole('button', { name: /enviar mensagem/ })).toBeEnabled();
	});

	it('sem resposta da API, avisa o erro', async () => {
		fetch.mockRejectedValue(new TypeError('Failed to fetch'));
		const f = montar();
		await preencherCerto(f);
		await f.usuario.click(f.enviar);

		expect(await screen.findByText(/não foi agora/)).toBeInTheDocument();
	});

	it('limite de mensagens (429) tem aviso próprio', async () => {
		fetch.mockResolvedValue(resposta(429, { ok: false }));
		const f = montar();
		await preencherCerto(f);
		await f.usuario.click(f.enviar);

		expect(await screen.findByText(/muitas mensagens seguidas/)).toBeInTheDocument();
	});

	it('robô que preenche a armadilha recebe "enviada" e nada sai', async () => {
		const f = montar();
		await preencherCerto(f);
		await f.usuario.type(document.getElementById('site')!, 'spam.com');
		await f.usuario.click(f.enviar);

		expect(await screen.findByText(/mensagem enviada ✓/)).toBeInTheDocument();
		expect(fetch).not.toHaveBeenCalled();
	});
});
