import { useRef, useState, type FormEvent } from 'react';
import { enviarContato } from '../services/api';
import { CAMPOS, MINIMO_MENSAGEM, VAZIO, validar, validarCampo, type Campo, type Erros, type Valores } from '../lib/contato';
import type { Cor } from '../lib/tipos';

/** O aviso embaixo do formulário; `vez` muda a cada aviso (a tela reanima mesmo com o mesmo texto). */
export interface AvisoDoFormulario {
	cor: Cor;
	texto: string;
	vez: number;
}

type CampoDeTexto = HTMLInputElement | HTMLTextAreaElement;

/**
 * Tudo do formulário de contato menos a aparência: valores, validação por campo (ao sair do campo e ao enviar,
 * com as regras de lib/contato.ts), envio pela API, trava contra envio duplo e os avisos de sucesso ou erro.
 */
export function useFormularioContato() {
	const [valores, setValores] = useState<Valores>(VAZIO);
	const [erros, setErros] = useState<Erros>({});
	// só mostra erro de campo que a pessoa já deixou (ou depois de tentar enviar), não enquanto digita pela primeira vez
	const [vistos, setVistos] = useState<Set<Campo>>(new Set());
	const [armadilha, setArmadilha] = useState('');
	const [aviso, setAviso] = useState<AvisoDoFormulario>();
	const [enviando, setEnviando] = useState(false);
	// trava síncrona: o estado do React só atualiza no próximo desenho, e um clique duplo cairia nesse intervalo
	const ocupado = useRef(false);
	const campos = useRef(new Map<Campo, CampoDeTexto>());

	const avisar = (cor: Cor, texto: string) => setAviso((a) => ({ cor, texto, vez: (a?.vez ?? 0) + 1 }));

	function aoMudar(campo: Campo, valor: string) {
		setValores((v) => ({ ...v, [campo]: valor }));
		// erro some (ou muda) enquanto a pessoa corrige
		if (vistos.has(campo)) setErros((e) => ({ ...e, [campo]: validarCampo(campo, valor) }));
	}

	function aoSair(campo: Campo) {
		// sair de um campo obrigatório vazio sem nunca ter digitado não é erro ainda
		if (!valores[campo] && !vistos.has(campo)) return;
		setVistos((v) => new Set(v).add(campo));
		setErros((e) => ({ ...e, [campo]: validarCampo(campo, valores[campo]) }));
	}

	function focarPrimeiroErro(lista: Erros) {
		const primeiro = CAMPOS.find((c) => lista[c]);
		if (primeiro) campos.current.get(primeiro)?.focus();
	}

	function limpar() {
		setValores(VAZIO);
		setErros({});
		setVistos(new Set());
		setArmadilha('');
	}

	async function enviar(evento: FormEvent<HTMLFormElement>) {
		evento.preventDefault();
		if (ocupado.current) return;

		const encontrados = validar(valores);
		setVistos(new Set(CAMPOS));
		setErros(encontrados);
		if (Object.keys(encontrados).length > 0) {
			avisar('vermelho', 'confira os campos destacados');
			focarPrimeiroErro(encontrados);
			return;
		}
		// armadilha preenchida = robô: finge que deu certo
		if (armadilha) {
			avisar('verde', 'mensagem enviada ✓');
			limpar();
			return;
		}

		ocupado.current = true;
		setEnviando(true);
		avisar('amarelo', 'enviando…');
		try {
			const resultado = await enviarContato(valores);
			if (resultado.tipo === 'limite') {
				avisar('amarelo', 'muitas mensagens seguidas · tente daqui a pouco');
			} else if (resultado.tipo === 'invalida') {
				// a API conferiu de novo e achou algo: volta pro campo certo
				setErros(resultado.erros);
				avisar('vermelho', 'confira os campos destacados');
				focarPrimeiroErro(resultado.erros);
			} else {
				avisar('verde', 'mensagem enviada ✓ · respondo no e-mail que você deixou');
				limpar();
			}
		} catch {
			avisar('vermelho', 'não foi agora · tente de novo ou use o e-mail ao lado');
		} finally {
			ocupado.current = false;
			setEnviando(false);
		}
	}

	/** O que cada campo precisa: valor, erro, eventos e a ref (pra focar o primeiro erro). */
	const campo = (nome: Campo) => ({
		campo: nome,
		valor: valores[nome],
		erro: erros[nome],
		aoMudar,
		aoSair,
		refCampo: (el: CampoDeTexto | null) => {
			if (el) campos.current.set(nome, el);
			else campos.current.delete(nome);
		},
	});

	const faltam = MINIMO_MENSAGEM - valores.mensagem.trim().length;
	/** "faltam N caracteres" enquanto a mensagem começou e ainda não chegou ao mínimo. */
	const dicaDaMensagem =
		valores.mensagem.trim().length > 0 && faltam > 0 ? `faltam ${faltam} ${faltam === 1 ? 'caractere' : 'caracteres'} (mínimo ${MINIMO_MENSAGEM})` : undefined;

	return { campo, dicaDaMensagem, armadilha, setArmadilha, aviso, enviando, enviar };
}
