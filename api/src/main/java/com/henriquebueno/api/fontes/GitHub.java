package com.henriquebueno.api.fontes;

import java.time.Clock;
import java.time.Instant;
import java.util.Arrays;
import java.util.List;
import java.util.function.Supplier;
import java.util.Map;
import java.util.regex.Pattern;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.henriquebueno.api.snapshot.Repositorio;

/**
 * Repositórios do perfil, direto da API do GitHub (nada cadastrado à mão):
 * - com token: os fixados no perfil (GraphQL, que exige token). Texto do card: a descrição do repo;
 *   sem descrição, o primeiro parágrafo do README; sem README, só nome e linguagens.
 * - sem token: os 6 públicos com push mais recente (REST, sem login; 60 chamadas por hora por IP).
 * Além disso, {@link #publicos()} lista todos os públicos (REST), que o painel oferece como destaque da home.
 * Se o GitHub disser que a cota acabou, nenhuma chamada sai até o horário que ele informou; a última lista fica.
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
			          pushedAt
			          languages(first: 3, orderBy: {field: SIZE, direction: DESC}) { nodes { name color } }
			          readme: object(expression: "HEAD:README.md") { ... on Blob { text } }
			        }
			      }
			    }
			  }
			}""";

	@JsonIgnoreProperties(ignoreUnknown = true)
	record Nome(String name, String color) {
	}

	@JsonIgnoreProperties(ignoreUnknown = true)
	record Linguagens(List<Nome> nodes) {
	}

	@JsonIgnoreProperties(ignoreUnknown = true)
	record Blob(String text) {
	}

	@JsonIgnoreProperties(ignoreUnknown = true)
	record Repo(String name, String url, String description, Linguagens languages, Blob readme, Instant pushedAt) {
	}

	/** Um repositório na API REST (sem token). */
	@JsonIgnoreProperties(ignoreUnknown = true)
	record RepoPublico(String name, @JsonProperty("html_url") String url, String description, String language,
			@JsonProperty("pushed_at") Instant pushedAt, boolean fork, boolean archived) {
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

	static final int QUANTOS_SEM_TOKEN = 6;

	private final Http http;
	private final String usuario;
	private final boolean comToken;
	private final Clock relogio;
	/** Até quando o GitHub mandou esperar (cota de requisições acabou). */
	private volatile Instant pausaAte;

	/** {@code comToken}: o {@code http} leva o cabeçalho Authorization e dá pra ler os fixados. */
	public GitHub(Http http, String usuario, boolean comToken) {
		this(http, usuario, comToken, Clock.systemUTC());
	}

	GitHub(Http http, String usuario, boolean comToken, Clock relogio) {
		this.http = http;
		this.usuario = usuario;
		this.comToken = comToken;
		this.relogio = relogio;
	}

	@Override
	public List<Repositorio> fixados() {
		return respeitandoOLimite(() -> comToken ? fixadosNoPerfil() : publicosMaisRecentes().stream().limit(QUANTOS_SEM_TOKEN).toList());
	}

	@Override
	public List<Repositorio> publicos() {
		return respeitandoOLimite(this::publicosMaisRecentes);
	}

	/** Se o GitHub disse que a cota acabou, nada sai até o horário que ele informou (vale pras duas leituras). */
	private List<Repositorio> respeitandoOLimite(Supplier<List<Repositorio>> leitura) {
		var agora = relogio.instant();
		if (pausaAte != null && agora.isBefore(pausaAte)) {
			throw new IllegalStateException("limite de requisições do GitHub até " + pausaAte + "; fica a última lista");
		}
		try {
			return leitura.get();
		} catch (Http.LimiteAtingido e) {
			pausaAte = e.ate;
			throw e;
		}
	}

	private List<Repositorio> fixadosNoPerfil() {
		var resposta = http.post("/graphql", Map.of("query", CONSULTA, "variables", Map.of("login", usuario)), Resposta.class);
		if (resposta.data() == null || resposta.data().user() == null) {
			throw new IllegalStateException("GitHub não devolveu os fixados: " + resposta.errors());
		}
		return resposta.data().user().pinnedItems().nodes().stream()
				.filter(r -> r.name() != null)
				.map(r -> {
					var linguagens = r.languages() == null || r.languages().nodes() == null ? List.<Nome>of() : r.languages().nodes();
					var cor = linguagens.isEmpty() ? null : linguagens.getFirst().color();
					return new Repositorio(r.name(), descricao(r), linguagens.stream().map(Nome::name).toList(), r.url(), cor, r.pushedAt());
				})
				.toList();
	}

	/** Os públicos do perfil, do push mais recente pro mais antigo (sem forks nem arquivados). Sem token, também viram os "fixados". */
	private List<Repositorio> publicosMaisRecentes() {
		var repos = http.get("/users/" + usuario + "/repos", Map.of("type", "owner", "sort", "pushed", "per_page", 100), RepoPublico[].class);
		return Arrays.stream(repos)
				.filter(r -> !r.fork() && !r.archived())
				.map(r -> new Repositorio(r.name(), limpo(r.description()), r.language() == null ? List.of() : List.of(r.language()), r.url(), null, r.pushedAt()))
				.toList();
	}

	private static String limpo(String s) {
		return s == null || s.isBlank() ? null : s.strip();
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
