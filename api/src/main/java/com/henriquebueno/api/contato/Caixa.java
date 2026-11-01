package com.henriquebueno.api.contato;

import java.io.IOException;
import java.io.UncheckedIOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardCopyOption;
import java.time.Clock;
import java.util.ArrayList;
import java.util.HexFormat;
import java.util.List;
import java.util.Optional;
import java.util.concurrent.ThreadLocalRandom;
import java.util.function.UnaryOperator;

import org.jboss.logging.Logger;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.henriquebueno.api.PortfolioConfig;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;

/**
 * As mensagens do formulário, em dados/mensagens.json (a mais nova primeiro). Guardar vem antes do e-mail:
 * se o e-mail falhar, a mensagem não se perde e aparece no painel. Ficam as últimas {@link #MAXIMO}.
 */
@ApplicationScoped
public class Caixa {

	static final int MAXIMO = 500;
	private static final Logger log = Logger.getLogger(Caixa.class);
	private static final TypeReference<List<Recebida>> LISTA = new TypeReference<>() {
	};

	private final Path arquivo;
	private final ObjectMapper json;
	private final Clock relogio;
	private List<Recebida> mensagens;

	@Inject
	Caixa(PortfolioConfig config, ObjectMapper json) {
		this(config.dados().resolve("mensagens.json"), json, Clock.systemUTC());
	}

	Caixa(Path arquivo, ObjectMapper json, Clock relogio) {
		this.arquivo = arquivo;
		this.json = json;
		this.relogio = relogio;
		this.mensagens = carregar();
	}

	public synchronized Recebida guardar(Mensagem m) {
		var nova = new Recebida(novoId(), relogio.instant(), m.nome(), m.email(), vazioViraNulo(m.assunto()), m.mensagem(), false, false, null);
		var lista = new ArrayList<Recebida>(mensagens.size() + 1);
		lista.add(nova);
		lista.addAll(mensagens.subList(0, Math.min(mensagens.size(), MAXIMO - 1)));
		salvar(lista);
		return nova;
	}

	public synchronized List<Recebida> todas() {
		return mensagens;
	}

	public synchronized Optional<Recebida> marcarLida(String id, boolean lida) {
		return trocar(id, m -> m.comLida(lida));
	}

	public synchronized Optional<Recebida> marcarRespondida(String id, boolean respondida) {
		var agora = relogio.instant();
		return trocar(id, m -> m.comRespondida(respondida, agora));
	}

	private Optional<Recebida> trocar(String id, UnaryOperator<Recebida> mudanca) {
		var alvo = mensagens.stream().filter(m -> m.id().equals(id)).findFirst().map(mudanca);
		alvo.ifPresent(nova -> salvar(mensagens.stream().map(m -> m.id().equals(id) ? nova : m).toList()));
		return alvo;
	}

	public synchronized boolean apagar(String id) {
		var resto = mensagens.stream().filter(m -> !m.id().equals(id)).toList();
		if (resto.size() == mensagens.size()) return false;
		salvar(resto);
		return true;
	}

	private void salvar(List<Recebida> novas) {
		try {
			Files.createDirectories(arquivo.getParent());
			var temporario = arquivo.resolveSibling(arquivo.getFileName() + ".tmp");
			json.writeValue(temporario.toFile(), novas);
			Files.move(temporario, arquivo, StandardCopyOption.REPLACE_EXISTING, StandardCopyOption.ATOMIC_MOVE);
		} catch (IOException e) {
			// sem gravar não dá pra dizer ao visitante que a mensagem chegou
			throw new UncheckedIOException("não consegui gravar " + arquivo, e);
		}
		mensagens = List.copyOf(novas);
	}

	private List<Recebida> carregar() {
		if (!Files.exists(arquivo)) return List.of();
		try {
			return List.copyOf(json.readValue(arquivo.toFile(), LISTA));
		} catch (IOException e) {
			// guarda o arquivo ruim com outro nome: a próxima mensagem não pode sobrescrever as antigas
			var copia = arquivo.resolveSibling(arquivo.getFileName() + ".ilegivel-" + relogio.millis());
			try {
				Files.move(arquivo, copia);
			} catch (IOException ex) {
				throw new UncheckedIOException("não consegui ler nem mover " + arquivo, ex);
			}
			log.errorf(e, "Não consegui ler %s; guardei como %s e comecei uma caixa nova", arquivo, copia.getFileName());
			return List.of();
		}
	}

	private static String vazioViraNulo(String s) {
		return s == null || s.isBlank() ? null : s;
	}

	private static String novoId() {
		var bytes = new byte[8];
		ThreadLocalRandom.current().nextBytes(bytes);
		return HexFormat.of().formatHex(bytes);
	}
}
