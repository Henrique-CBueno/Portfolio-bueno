package com.henriquebueno.api.fontes;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardCopyOption;
import java.nio.file.attribute.PosixFilePermissions;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.HexFormat;
import java.util.Optional;
import java.util.function.Supplier;

import org.jboss.logging.Logger;

import com.fasterxml.jackson.databind.ObjectMapper;

/**
 * O token da Meta em uso. O do login do Instagram vence em 60 dias e é renovado pela API; o renovado fica
 * em dados/meta-token.json (só o dono lê). Se o META_API_KEY mudar, o arquivo antigo é ignorado.
 */
public class TokenMeta implements Supplier<String> {

	private static final Logger log = Logger.getLogger(TokenMeta.class);

	record Arquivo(String origem, String token) {
	}

	private final String origem;
	private final Path arquivo;
	private final ObjectMapper json;
	private volatile String atual;

	public TokenMeta(String doAmbiente, Path arquivo, ObjectMapper json) {
		this.origem = resumo(doAmbiente);
		this.arquivo = arquivo;
		this.json = json;
		this.atual = lerRenovado().orElse(doAmbiente);
	}

	@Override
	public String get() {
		return atual;
	}

	public void trocar(String novo) {
		atual = novo;
		try {
			Files.createDirectories(arquivo.getParent());
			var temporario = arquivo.resolveSibling(arquivo.getFileName() + ".tmp");
			Files.deleteIfExists(temporario);
			try {
				Files.createFile(temporario, PosixFilePermissions.asFileAttribute(PosixFilePermissions.fromString("rw-------")));
			} catch (UnsupportedOperationException e) {
				Files.createFile(temporario);
			}
			json.writeValue(temporario.toFile(), new Arquivo(origem, novo));
			Files.move(temporario, arquivo, StandardCopyOption.REPLACE_EXISTING, StandardCopyOption.ATOMIC_MOVE);
		} catch (IOException e) {
			log.warnf("Não consegui gravar o token renovado em %s: %s", arquivo, e.getMessage());
		}
	}

	private Optional<String> lerRenovado() {
		if (!Files.exists(arquivo)) return Optional.empty();
		try {
			var salvo = json.readValue(arquivo.toFile(), Arquivo.class);
			return origem.equals(salvo.origem()) ? Optional.ofNullable(salvo.token()) : Optional.empty();
		} catch (IOException e) {
			log.warnf("Não consegui ler %s; usando o META_API_KEY", arquivo);
			return Optional.empty();
		}
	}

	private static String resumo(String token) {
		try {
			return HexFormat.of().formatHex(MessageDigest.getInstance("SHA-256").digest(token.getBytes(StandardCharsets.UTF_8)));
		} catch (NoSuchAlgorithmException e) {
			throw new IllegalStateException(e);
		}
	}
}
