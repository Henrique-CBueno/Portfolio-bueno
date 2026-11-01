/**
 * Regras do formulário de contato. São as mesmas da API (api/.../contato/Mensagem.java), com os mesmos textos:
 * o site avisa antes de enviar e a API confere de novo. Mude nos dois.
 */
export type Campo = 'nome' | 'email' | 'assunto' | 'mensagem';
export type Valores = Record<Campo, string>;
export type Erros = Partial<Record<Campo, string>>;

export const CAMPOS: Campo[] = ['nome', 'email', 'assunto', 'mensagem'];
export const MINIMO_MENSAGEM = 20;
export const MAXIMO: Record<Campo, number> = { nome: 120, email: 200, assunto: 160, mensagem: 5000 };
export const VAZIO: Valores = { nome: '', email: '', assunto: '', mensagem: '' };

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** A mensagem de erro do campo, ou undefined se está certo. Espaço nas pontas não conta. */
export function validarCampo(campo: Campo, bruto: string): string | undefined {
	const valor = bruto.trim();
	switch (campo) {
		case 'nome':
			if (!valor) return 'conta como posso te chamar';
			if (valor.length > MAXIMO.nome) return `nome com no máximo ${MAXIMO.nome} caracteres`;
			return undefined;
		case 'email':
			if (!valor) return 'falta o e-mail';
			if (!EMAIL.test(valor)) return 'e-mail inválido';
			if (valor.length > MAXIMO.email) return `e-mail com no máximo ${MAXIMO.email} caracteres`;
			return undefined;
		case 'assunto':
			if (valor.length > MAXIMO.assunto) return `assunto com no máximo ${MAXIMO.assunto} caracteres`;
			return undefined;
		case 'mensagem':
			if (!valor) return 'falta a mensagem';
			if (valor.length < MINIMO_MENSAGEM) return `mensagem com no mínimo ${MINIMO_MENSAGEM} caracteres`;
			if (valor.length > MAXIMO.mensagem) return `mensagem com no máximo ${MAXIMO.mensagem} caracteres`;
			return undefined;
	}
}

export function validar(valores: Valores): Erros {
	const erros: Erros = {};
	for (const campo of CAMPOS) {
		const erro = validarCampo(campo, valores[campo]);
		if (erro) erros[campo] = erro;
	}
	return erros;
}
