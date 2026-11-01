import { useEffect, useRef, useState } from 'react';
import { CheckCheck, LoaderCircle, Mail, Reply, Trash2 } from 'lucide-react';
import { FalhaApi } from '../components/FalhaApi';
import { useMensagens } from '../hooks/useMensagens';
import type { Recebida } from '../services/painel';
import { Botao } from '../components/Botao';
import { Card } from '../components/Card';

const dia = new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'short', timeZone: 'America/Sao_Paulo' });
const quando = new Intl.DateTimeFormat('pt-BR', {
	day: '2-digit',
	month: 'short',
	year: 'numeric',
	hour: '2-digit',
	minute: '2-digit',
	timeZone: 'America/Sao_Paulo',
});

/** Só endereço com cara de e-mail vira link mailto (o que vem do formulário passa por aqui). */
const emailSeguro = (email: string) => /^[^\s@<>"]+@[^\s@<>"]+\.[^\s@<>"]+$/.test(email);

/** As mensagens do formulário: a mais nova primeiro, as não lidas destacadas. */
export function Mensagens() {
	const { mensagens, falhou, carregar, marcar, apagar, novas, semResposta } = useMensagens();

	return (
		<section className="bloco">
			<div className="cab-bloco">
				<h2>
					Mensagens{' '}
					{novas > 0 && (
						<em>
							{novas} {novas === 1 ? 'nova' : 'novas'}
						</em>
					)}
				</h2>
				{mensagens && mensagens.length > 0 && <small className="dica">{semResposta === 0 ? 'todas respondidas ✓' : `${semResposta} sem resposta`}</small>}
				<small className="dica">do formulário de contato do site · também chegam por e-mail</small>
			</div>
			{falhou && <FalhaApi oque="as mensagens" tentarDeNovo={carregar} />}
			{!falhou && mensagens === undefined && (
				<div className="mensagens">
					<span className="so-leitor" role="status">
						carregando as mensagens
					</span>
					{Array.from({ length: 2 }, (_, i) => (
						<Card key={i} className="mensagem esqueleto-mensagem" aria-hidden="true">
							<span className="esqueleto"></span>
							<span className="esqueleto"></span>
							<span className="esqueleto"></span>
						</Card>
					))}
				</div>
			)}
			{mensagens?.length === 0 && (
				<Card as="p" className="vazio-mensagens">
					Nenhuma mensagem ainda. Quando alguém escrever pelo site, ela aparece aqui.
				</Card>
			)}
			{mensagens && mensagens.length > 0 && (
				<div className="mensagens">
					{mensagens.map((m) => (
						<Item key={m.id} mensagem={m} aoMarcar={(marca, valor) => marcar(m.id, marca, valor)} aoApagar={() => apagar(m.id)} />
					))}
				</div>
			)}
		</section>
	);
}

interface PropsItem {
	mensagem: Recebida;
	aoMarcar: (marca: 'lida' | 'respondida', valor: boolean) => Promise<void>;
	aoApagar: () => Promise<void>;
}

/** Uma mensagem: as ações vêm prontas do useMensagens; aqui só o "ocupado" e o "confirmar?" do apagar. */
function Item({ mensagem: m, aoMarcar, aoApagar }: PropsItem) {
	const [ocupado, setOcupado] = useState<'lida' | 'respondida' | 'apagar' | null>(null);
	const [confirmar, setConfirmar] = useState(false);
	const [erro, setErro] = useState<string>();
	const trava = useRef(false);

	// apagar em dois toques, sem janela de confirmação do navegador
	useEffect(() => {
		if (!confirmar) return;
		const volta = setTimeout(() => setConfirmar(false), 3000);
		return () => clearTimeout(volta);
	}, [confirmar]);

	async function acao(qual: 'lida' | 'respondida' | 'apagar') {
		if (trava.current) return;
		if (qual === 'apagar' && !confirmar) {
			setConfirmar(true);
			return;
		}
		trava.current = true;
		setOcupado(qual);
		setErro(undefined);
		try {
			if (qual === 'apagar') await aoApagar();
			else await aoMarcar(qual, qual === 'lida' ? !m.lida : !m.respondida);
		} catch {
			setErro(qual === 'apagar' ? 'não deu pra apagar agora' : 'não deu pra marcar agora');
		} finally {
			trava.current = false;
			setOcupado(null);
			setConfirmar(false);
		}
	}

	const assunto = m.assunto ? `Re: ${m.assunto}` : 'Re: sua mensagem pelo site';
	return (
		<Card as="article" className={['mensagem', !m.lida && 'nova', m.respondida && 'respondida'].filter(Boolean).join(' ')}>
			<header>
				<div>
					<strong>{m.nome}</strong>
					{emailSeguro(m.email) ? <a href={`mailto:${m.email}`}>{m.email}</a> : <span>{m.email}</span>}
				</div>
				<div className="lado">
					{!m.lida && <span className="pill amarelo">nova</span>}
					{m.respondida && <span className="pill verde">respondida{m.respondidaEm ? ` em ${dia.format(new Date(m.respondidaEm))}` : ''}</span>}
					<time dateTime={m.recebidaEm}>{quando.format(new Date(m.recebidaEm))}</time>
				</div>
			</header>
			{m.assunto && <p className="assunto">{m.assunto}</p>}
			<p className="texto">{m.mensagem}</p>
			<div className="acoes-mensagem">
				{emailSeguro(m.email) && (
					<Botao href={`mailto:${m.email}?subject=${encodeURIComponent(assunto)}`}>
						<Reply /> responder
					</Botao>
				)}
				<Botao className={m.respondida ? undefined : 'marcar-respondida'} disabled={ocupado !== null} onClick={() => acao('respondida')}>
					{ocupado === 'respondida' ? <LoaderCircle className="gira" aria-hidden="true" /> : <CheckCheck />}
					{m.respondida ? 'desfazer "respondida"' : 'marcar como respondida'}
				</Botao>
				{!m.respondida && (
					<Botao type="button" disabled={ocupado !== null} onClick={() => acao('lida')}>
						{ocupado === 'lida' ? <LoaderCircle className="gira" aria-hidden="true" /> : <Mail />}
						{m.lida ? 'marcar como não lida' : 'marcar como lida'}
					</Botao>
				)}
				<Botao variante={confirmar ? 'perigo' : undefined} disabled={ocupado !== null} onClick={() => acao('apagar')}>
					{ocupado === 'apagar' ? <LoaderCircle className="gira" aria-hidden="true" /> : <Trash2 />}
					{confirmar ? 'confirmar?' : 'apagar'}
				</Botao>
				{erro && (
					<span className="pill vermelho" role="alert">
						{erro}
					</span>
				)}
			</div>
		</Card>
	);
}
