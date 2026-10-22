package com.henriquebueno.api.fontes;

import java.util.List;
import java.util.Map;
import java.util.regex.Pattern;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.henriquebueno.api.snapshot.Repositorio;

/**
 * Repositórios fixados no perfil (GraphQL, exige token). Texto do card: a descrição do repo;
 * sem descrição, o primeiro parágrafo do README; sem README, só nome e linguagens.
 */
public class GitHub implements Fontes.DeRepositorios {

	private static final String CONSULTA = """
			query($login: String!) {
			  user(login: $login) {
			    pinnedItems(first: 6, types: REPOSITORY) {
			      nodes {
			        ... on Repository {
			          name
			          url
			          description
			          languages(first: 3, orderBy: {field: SIZE, direction: DESC}) { nodes { name } }
			          readme: object(expression: "HEAD:README.md") { ... on Blob { text } }
			        }
			      }
			    }
			  }
			}""";

	@JsonIgnoreProperties(ignoreUnknown = true)
	record Nome(String name) {
	}

	@JsonIgnoreProperties(ignoreUnknown = true)
	record Linguagens(List<Nome> nodes) {
	}

	@JsonIgnoreProperties(ignoreUnknown = true)
	record Blob(String text) {
	}

	@JsonIgnoreProperties(ignoreUnknown = true)
	record Repo(String name, String url, String description, Linguagens languages, Blob readme) {
	}

	@JsonIgnoreProperties(ignoreUnknown = true)
	record Fixados(List<Repo> nodes) {
	}

	@JsonIgnoreProperties(ignoreUnknown = true)
	record Usuario(Fixados pinnedItems) {
	}

	@JsonIgnoreProperties(ignoreUnknown = true)
	record Dados(Usuario user) {
	}

	@JsonIgnoreProperties(ignoreUnknown = true)
	record Resposta(Dados data, List<Map<String, Object>> errors) {
	}

	private static final int MAX_DESCRICAO = 280;
	private static final Pattern MARCACAO = Pattern.compile("!\\[[^]]*]\\([^)]*\\)|\\[([^]]*)]\\([^)]*\\)|<[^>]+>|[*_`]");

	private final Http http;
	private final String usuario;

	/** {@code http} já leva o cabeçalho Authorization com o token. */
	public GitHub(Http http, String usuario) {
		this.http = http;
		this.usuario = usuario;
	}

	@Override
	public List<Repositorio> fixados() {
		var resposta = http.post("/graphql", Map.of("query", CONSULTA, "variables", Map.of("login", usuario)), Resposta.class);
		if (resposta.data() == null || resposta.data().user() == null) {
			throw new IllegalStateException("GitHub não devolveu os fixados: " + resposta.errors());
		}
		return resposta.data().user().pinnedItems().nodes().stream()
				.filter(r -> r.name() != null)
				.map(r -> new Repositorio(r.name(), descricao(r), r.languages().nodes().stream().map(Nome::name).toList(), r.url()))
				.toList();
	}

	private static String descricao(Repo r) {
		if (r.description() != null && !r.description().isBlank()) return r.description().strip();
		return r.readme() == null ? null : primeiroParagrafo(r.readme().text());
	}

	/** Primeiro parágrafo de texto corrido do README: pula títulos, selos, imagens, listas, tabelas e código. */
	static String primeiroParagrafo(String readme) {
		if (readme == null) return null;
		var dentroDeCodigo = false;
		var paragrafo = new StringBuilder();
		for (var linha : readme.lines().toList()) {
			var l = linha.strip();
			if (l.startsWith("```")) {
				dentroDeCodigo = !dentroDeCodigo;
				continue;
			}
			if (dentroDeCodigo) continue;
			if (l.isEmpty()) {
				if (!paragrafo.isEmpty()) break;
				continue;
			}
			if (l.startsWith("#") || l.startsWith("|") || l.startsWith(">") || l.startsWith("- ") || l.startsWith("* ") || l.startsWith("<") || l.startsWith("![") || l.startsWith("[![")) {
				if (!paragrafo.isEmpty()) break;
				continue;
			}
			paragrafo.append(paragrafo.isEmpty() ? "" : " ").append(l);
		}
		var texto = MARCACAO.matcher(paragrafo).replaceAll("$1").replaceAll("\\s+", " ").strip();
		if (texto.isEmpty()) return null;
		return texto.length() <= MAX_DESCRICAO ? texto : texto.substring(0, texto.lastIndexOf(' ', MAX_DESCRICAO)) + "…";
	}
}
