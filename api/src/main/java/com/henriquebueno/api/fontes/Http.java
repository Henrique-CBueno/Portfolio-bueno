package com.henriquebueno.api.fontes;

import java.io.IOException;
import java.net.URI;
import java.net.URLEncoder;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
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

	private static String query(Map<String, ?> parametros) {
		return parametros.entrySet().stream()
				.map(e -> e.getKey() + "=" + URLEncoder.encode(String.valueOf(e.getValue()), StandardCharsets.UTF_8))
				.collect(Collectors.joining("&"));
	}

	/** Fonte respondeu com erro, demorou demais ou mandou algo que não deu pra ler. */
	public static class FalhaNaFonte extends RuntimeException {
		public FalhaNaFonte(String onde, Throwable causa) {
			super(onde + ": " + causa.getMessage(), causa);
		}
	}
}
