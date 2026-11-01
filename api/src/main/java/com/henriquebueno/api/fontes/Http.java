package com.henriquebueno.api.fontes;

import java.io.IOException;
import java.net.URI;
import java.net.URLEncoder;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.time.Instant;
import java.util.Map;
import java.util.stream.Collectors;

import com.fasterxml.jackson.databind.ObjectMapper;

/**
 * Cliente HTTP mínimo pras redes: JSON de ida e volta e timeout curto,
 * pra uma fonte lenta não segurar a coleta.
 */
public class Http {

	static final Duration TIMEOUT = Duration.ofSeconds(6);

	private final HttpClient cliente = HttpClient.newBuilder().connectTimeout(Duration.ofSeconds(3)).build();
	private final ObjectMapper json;
	private final String base;
	private final Map<String, String> cabecalhos;

	public Http(ObjectMapper json, String base, Map<String, String> cabecalhos) {
		this.json = json;
		this.base = base.replaceAll("/$", "");
		this.cabecalhos = cabecalhos;
	}

	public <T> T get(String caminho, Map<String, ?> parametros, Class<T> tipo) {
		return enviar(pedido(caminho + "?" + query(parametros)).GET(), tipo);
	}

	public <T> T post(String caminho, Object corpo, Class<T> tipo) {
		try {
			var bytes = json.writeValueAsBytes(corpo);
			return enviar(pedido(caminho).header("Content-Type", "application/json").POST(HttpRequest.BodyPublishers.ofByteArray(bytes)), tipo);
		} catch (IOException e) {
			throw new FalhaNaFonte(caminho, e);
		}
	}

	private HttpRequest.Builder pedido(String caminho) {
		var b = HttpRequest.newBuilder(URI.create(base + caminho)).timeout(TIMEOUT).header("Accept", "application/json");
		cabecalhos.forEach(b::header);
		return b;
	}

	private <T> T enviar(HttpRequest.Builder pedido, Class<T> tipo) {
		var p = pedido.build();
		try {
			var resposta = cliente.send(p, HttpResponse.BodyHandlers.ofByteArray());
			var limite = limite(resposta);
			if (limite != null) throw new LimiteAtingido(p.uri().getPath(), limite);
			if (resposta.statusCode() / 100 != 2) {
				throw new FalhaNaFonte(p.uri().getPath(), new IOException("HTTP " + resposta.statusCode() + ": " + new String(resposta.body(), StandardCharsets.UTF_8)));
			}
			return json.readValue(resposta.body(), tipo);
		} catch (IOException e) {
			throw new FalhaNaFonte(p.uri().getPath(), e);
		} catch (InterruptedException e) {
			Thread.currentThread().interrupt();
			throw new FalhaNaFonte(p.uri().getPath(), e);
		}
	}

	/**
	 * Resposta de limite de requisições (GitHub e afins): 429, ou 403 com a cota zerada. Devolve até quando
	 * esperar: o retry-after (segundos) ou o x-ratelimit-reset (horário); sem nenhum, 1 minuto.
	 */
	static Instant limite(HttpResponse<?> resposta) {
		var status = resposta.statusCode();
		var cabecalhos = resposta.headers();
		var zerado = cabecalhos.firstValue("x-ratelimit-remaining").map("0"::equals).orElse(false);
		var retryAfter = cabecalhos.firstValue("retry-after");
		if (status != 429 && !(status == 403 && (zerado || retryAfter.isPresent()))) return null;
		var agora = Instant.now();
		try {
			if (retryAfter.isPresent()) return agora.plusSeconds(Long.parseLong(retryAfter.get().strip()));
			var reset = cabecalhos.firstValue("x-ratelimit-reset");
			if (reset.isPresent()) return Instant.ofEpochSecond(Long.parseLong(reset.get().strip()));
		} catch (NumberFormatException e) {
			// cabeçalho estranho: espera o padrão
		}
		return agora.plusSeconds(60);
	}

	private static String query(Map<String, ?> parametros) {
		return parametros.entrySet().stream()
				.map(e -> e.getKey() + "=" + URLEncoder.encode(String.valueOf(e.getValue()), StandardCharsets.UTF_8))
				.collect(Collectors.joining("&"));
	}

	/** A fonte disse que a cota de requisições acabou: nada de chamar de novo antes de {@code ate}. */
	public static class LimiteAtingido extends FalhaNaFonte {
		public final Instant ate;

		public LimiteAtingido(String onde, Instant ate) {
			super(onde, new IOException("limite de requisições atingido até " + ate));
			this.ate = ate;
		}
	}

	/** Fonte respondeu com erro, demorou demais ou mandou algo que não deu pra ler. */
	public static class FalhaNaFonte extends RuntimeException {
		public FalhaNaFonte(String onde, Throwable causa) {
			super(onde + ": " + causa.getMessage(), causa);
		}
	}
}
