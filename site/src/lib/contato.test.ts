import { describe, expect, it } from 'vitest';
import { MINIMO_MENSAGEM, validar, validarCampo, VAZIO } from './contato';

// As mesmas regras e textos da API (api/.../contato/Mensagem.java, testada em ApiTest).
describe('validação do formulário de contato', () => {
	it('nome: obrigatório e até 120 caracteres', () => {
		expect(validarCampo('nome', '')).toBe('conta como posso te chamar');
		expect(validarCampo('nome', '   ')).toBe('conta como posso te chamar');
		expect(validarCampo('nome', 'a'.repeat(121))).toBe('nome com no máximo 120 caracteres');
		expect(validarCampo('nome', 'Ana')).toBeUndefined();
	});

	it('e-mail: obrigatório e com domínio', () => {
		expect(validarCampo('email', '')).toBe('falta o e-mail');
		expect(validarCampo('email', 'ana')).toBe('e-mail inválido');
		expect(validarCampo('email', 'ana@exemplo')).toBe('e-mail inválido');
		expect(validarCampo('email', 'ana @exemplo.com')).toBe('e-mail inválido');
		expect(validarCampo('email', ' ana@exemplo.com ')).toBeUndefined();
	});

	it('assunto: opcional, até 160 caracteres', () => {
		expect(validarCampo('assunto', '')).toBeUndefined();
		expect(validarCampo('assunto', 'a'.repeat(161))).toBe('assunto com no máximo 160 caracteres');
	});

	it('mensagem: obrigatória, de 20 a 5000 caracteres, sem contar espaço nas pontas', () => {
		expect(validarCampo('mensagem', '')).toBe('falta a mensagem');
		expect(validarCampo('mensagem', 'oi tudo bem')).toBe('mensagem com no mínimo 20 caracteres');
		expect(validarCampo('mensagem', `   ${'a'.repeat(MINIMO_MENSAGEM - 1)}   `)).toBe('mensagem com no mínimo 20 caracteres');
		expect(validarCampo('mensagem', 'a'.repeat(MINIMO_MENSAGEM))).toBeUndefined();
		expect(validarCampo('mensagem', 'a'.repeat(5001))).toBe('mensagem com no máximo 5000 caracteres');
	});

	it('validar devolve só os campos com problema', () => {
		expect(validar(VAZIO)).toEqual({ nome: 'conta como posso te chamar', email: 'falta o e-mail', mensagem: 'falta a mensagem' });
		expect(validar({ nome: 'Ana', email: 'ana@exemplo.com', assunto: '', mensagem: 'Quero conversar sobre uma parceria.' })).toEqual({});
	});
});
