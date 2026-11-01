package com.henriquebueno.api.fontes;

import java.io.IOException;
import java.net.InetSocketAddress;
import java.net.URI;
import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.CopyOnWriteArrayList;

import com.sun.net.httpserver.HttpServer;

/** Servidor HTTP falso pros testes das fontes: responde JSON fixo por caminho e guarda os pedidos. */
class Servidor implements AutoCloseable {

	record Pedido(String metodo, URI uri, Map<String, List<String>> cabecalhos, String corpo) {
	}

	private final HttpServer http;
	private final Map<String, String> respostas = new ConcurrentHashMap<>();
	final List<Pedido> pedidos = new CopyOnWriteArrayList<>();

	Servidor() throws IOException {
		http = HttpServer.create(new InetSocketAddress("127.0.0.1", 0), 0);
		http.createContext("/", troca -> {
			var corpo = new String(troca.getRequestBody().readAllBytes(), StandardCharsets.UTF_8);
			pedidos.add(new Pedido(troca.getRequestMethod(), troca.getRequestURI(), troca.getRequestHeaders(), corpo));
			var resposta = respostas.get(troca.getRequestURI().getPath());
			var especial = especiais.get(troca.getRequestURI().getPath());
			var bytes = (especial != null ? especial.json() : resposta == null ? "{}" : resposta).getBytes(StandardCharsets.UTF_8);
			troca.getResponseHeaders().add("Content-Type", "application/json");
			if (especial != null) especial.cabecalhos().forEach((k, v) -> troca.getResponseHeaders().add(k, v));
			troca.sendResponseHeaders(especial != null ? especial.status() : resposta == null ? 404 : 200, bytes.length);
			troca.getResponseBody().write(bytes);
			troca.close();
		});
		http.start();
	}

	record Especial(int status, String json, Map<String, String> cabecalhos) {
	}

	private final Map<String, Especial> especiais = new ConcurrentHashMap<>();

	/** Resposta com status e cabeçalhos próprios (ex.: o 403 de limite do GitHub). */
	Servidor responder(String caminho, int status, String json, Map<String, String> cabecalhos) {
		especiais.put(caminho, new Especial(status, json, cabecalhos));
		return this;
	}

	Servidor responder(String caminho, String json) {
		respostas.put(caminho, json);
		return this;
	}

	String base() {
		return "http://127.0.0.1:" + http.getAddress().getPort();
	}

	@Override
	public void close() {
		http.stop(0);
	}
}
