package com.henriquebueno.api.fontes;

import java.time.Instant;
import java.time.OffsetDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Optional;

import org.jboss.logging.Logger;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.henriquebueno.api.snapshot.Contagem;
import com.henriquebueno.api.snapshot.Rede;

/**
 * Instagram pela Graph API: seguidores e os vídeos (Reels) mais recentes da conta profissional.
 * Aceita os dois tipos de token da Meta: o do Facebook (graph.facebook.com, conta do Instagram ligada
 * a uma Página) e o do login do Instagram (graph.instagram.com, conta "/me"). O tipo não dá pra saber
 * pelo texto do token, então a primeira leitura pergunta aos dois e guarda qual respondeu.
 */
public class Instagram implements Fontes.DeContagem, Fontes.DeVideos {

	private static final String CAMPOS_MIDIA = "id,caption,media_type,media_product_type,permalink,thumbnail_url,timestamp";
	/** O Instagram manda "2026-10-20T21:00:00+0000". */
	private static final DateTimeFormatter DATA = DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH:mm:ssZ");

	@JsonIgnoreProperties(ignoreUnknown = true)
	record Perfil(@JsonProperty("followers_count") Long seguidores) {
	}

	@JsonIgnoreProperties(ignoreUnknown = true)
	record Midia(String id, String caption, @JsonProperty("media_type") String tipo, String permalink,
			@JsonProperty("thumbnail_url") String miniatura, String timestamp) {
	}

	@JsonIgnoreProperties(ignoreUnknown = true)
	record Midias(List<Midia> data) {
	}

	@JsonIgnoreProperties(ignoreUnknown = true)
	record Id(String id) {
	}

	@JsonIgnoreProperties(ignoreUnknown = true)
	record Pagina(@JsonProperty("instagram_business_account") Id contaInstagram) {
	}

	@JsonIgnoreProperties(ignoreUnknown = true)
	record Paginas(List<Pagina> data) {
	}

	@JsonIgnoreProperties(ignoreUnknown = true)
	record Renovado(@JsonProperty("access_token") String token) {
	}

	private static final Logger log = Logger.getLogger(Instagram.class);

	private final Http facebook;
	private final Http instagram;
	private final TokenMeta token;
	private final String versao;
	private final int quantas;
	/** Descoberto na primeira leitura: true = token do Facebook, false = do login do Instagram. */
	private volatile Boolean doFacebook;
	/** Id da conta do Instagram (só com token do Facebook): da configuração ou descoberto na primeira leitura. */
	private volatile String conta;

	public Instagram(Http facebook, Http instagram, TokenMeta token, Optional<String> conta, String versao, int quantas) {
		this.conta = conta.filter(c -> !c.isBlank()).orElse(null);
		this.facebook = facebook;
		this.instagram = instagram;
		this.token = token;
		this.versao = versao;
		this.quantas = quantas;
	}

	@Override
	public Rede rede() {
		return Rede.INSTAGRAM;
	}

	@Override
	public Contagem ler() {
		var perfil = http().get(caminho(""), Map.of("fields", "followers_count", "access_token", token.get()), Perfil.class);
		if (perfil.seguidores() == null) return Contagem.semValor(Rede.INSTAGRAM);
		return Contagem.automatica(Rede.INSTAGRAM, perfil.seguidores(), false);
	}

	@Override
	public List<Fontes.Publicacao> recentes() {
		var midias = http().get(caminho("/media"), Map.of("fields", CAMPOS_MIDIA, "limit", quantas, "access_token", token.get()), Midias.class);
		if (midias.data() == null) return List.of();
		return midias.data().stream()
				// só vídeo vira card (Reels são VIDEO); fotos e carrosséis ficam de fora
				.filter(m -> "VIDEO".equals(m.tipo()) && m.permalink() != null && m.miniatura() != null && m.timestamp() != null)
				.map(m -> new Fontes.Publicacao(m.id(), m.caption(), m.permalink(), m.miniatura(), data(m.timestamp())))
				.toList();
	}

	/** O token do login do Instagram vence em 60 dias; renovado todo dia, nunca chega lá. O do Facebook não é renovado aqui. */
	public void renovarToken() {
		if (doFacebook()) return;
		var renovado = instagram.get("/refresh_access_token", Map.of("grant_type", "ig_refresh_token", "access_token", token.get()), Renovado.class);
		if (renovado.token() != null && !renovado.token().isBlank()) token.trocar(renovado.token());
	}

	/** Pergunta primeiro ao Facebook, depois ao Instagram; se os dois recusam, tenta de novo na próxima rodada. */
	public boolean doFacebook() {
		if (doFacebook != null) return doFacebook;
		var quem = Map.of("fields", "id", "access_token", token.get());
		try {
			facebook.get("/" + versao + "/me", quem, Id.class);
			doFacebook = true;
		} catch (Http.FalhaNaFonte noFacebook) {
			try {
				instagram.get("/" + versao + "/me", quem, Id.class);
				doFacebook = false;
			} catch (Http.FalhaNaFonte noInstagram) {
				throw new IllegalStateException("META_API_KEY recusado pelo Facebook (" + noFacebook.getMessage() + ") e pelo Instagram (" + noInstagram.getMessage() + ")");
			}
		}
		log.infof("META_API_KEY é um token do %s", doFacebook ? "Facebook (conta do Instagram ligada a uma Página)" : "login do Instagram (renovado todo dia)");
		return doFacebook;
	}

	private Http http() {
		return doFacebook() ? facebook : instagram;
	}

	private String caminho(String resto) {
		return "/" + versao + "/" + (doFacebook() ? conta() : "me") + resto;
	}

	/** Token de Página: a própria Página tem a conta. Token de usuário: a primeira Página com conta ligada. */
	private String conta() {
		if (conta != null) return conta;
		Pagina pagina;
		try {
			pagina = facebook.get("/" + versao + "/me", Map.of("fields", "instagram_business_account", "access_token", token.get()), Pagina.class);
		} catch (Http.FalhaNaFonte e) {
			pagina = null;
		}
		if (pagina != null && pagina.contaInstagram() != null) return conta = pagina.contaInstagram().id();
		var paginas = facebook.get("/" + versao + "/me/accounts", Map.of("fields", "instagram_business_account", "access_token", token.get()), Paginas.class);
		return conta = (paginas.data() == null ? List.<Pagina>of() : paginas.data()).stream()
				.map(Pagina::contaInstagram).filter(Objects::nonNull).map(Id::id).findFirst()
				.orElseThrow(() -> new IllegalStateException("o token não vê nenhuma Página com conta do Instagram ligada (faltam as permissões pages_show_list e pages_read_engagement, ou a conta não está ligada a uma Página)"));
	}

	static Instant data(String texto) {
		return OffsetDateTime.parse(texto, DATA).toInstant();
	}
}
