package com.henriquebueno.api.admin;

import java.time.Clock;
import java.time.Instant;
import java.util.List;
import java.util.Map;

import com.henriquebueno.api.fontes.Conjunto;
import com.henriquebueno.api.snapshot.Contagem;
import com.henriquebueno.api.snapshot.Estado;
import com.henriquebueno.api.snapshot.Rede;

import io.quarkus.runtime.StartupEvent;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.enterprise.event.Observes;
import jakarta.inject.Inject;

/**
 * Os números que não têm API ligada, digitados no painel: hoje só o Instagram, e só sem META_API_KEY.
 * O TikTok não mostra número no site, então não entra no painel e o valor guardado é apagado ao iniciar.
 */
@ApplicationScoped
public class Numeros {

	/** Como o painel mostra uma contagem: digitável ou lida da rede. */
	public record NoPainel(Rede rede, Long valor, boolean aproximado, boolean manual, Instant atualizadoEm, boolean editavel) {
	}

	private final Estado estado;
	private final boolean instagramAutomatico;
	private final Clock relogio;

	@Inject
	Numeros(Estado estado, Conjunto fontes) {
		this(estado, fontes.instagram().isPresent(), Clock.systemUTC());
	}

	Numeros(Estado estado, boolean instagramAutomatico, Clock relogio) {
		this.estado = estado;
		this.instagramAutomatico = instagramAutomatico;
		this.relogio = relogio;
	}

	/** Número do TikTok guardado de antes (era digitado no painel): sai do snapshot, que é público. */
	void aoIniciar(@Observes StartupEvent e) {
		estado.atual().contagens().stream()
				.filter(c -> c.rede() == Rede.TIKTOK && c.valor() != null)
				.findFirst()
				.ifPresent(c -> estado.atualizarContagem(Contagem.semValor(Rede.TIKTOK)));
	}

	public List<NoPainel> noPainel() {
		return estado.atual().contagens().stream()
				.filter(c -> c.rede() != Rede.TIKTOK)
				.map(c -> new NoPainel(c.rede(), c.valor(), c.aproximado(), c.manual(), c.atualizadoEm(), editavel(c.rede())))
				.toList();
	}

	public synchronized Contagem digitar(Rede rede, Long valor) {
		if (rede == Rede.TIKTOK) throw new Invalido(Map.of("rede", "o TikTok mostra só o @, sem número"));
		if (!editavel(rede)) throw new Invalido(Map.of("rede", "o " + nome(rede) + " é lido pela API dele"));
		if (valor != null && valor < 0) throw new Invalido(Map.of("valor", "não pode ser negativo"));
		var contagem = Contagem.manual(rede, valor, relogio.instant());
		estado.atualizarContagem(contagem);
		return contagem;
	}

	private boolean editavel(Rede rede) {
		return switch (rede) {
			case TIKTOK -> false;
			case INSTAGRAM -> !instagramAutomatico;
			case YOUTUBE -> false;
		};
	}

	private static String nome(Rede rede) {
		return switch (rede) {
			case INSTAGRAM -> "Instagram";
			case TIKTOK -> "TikTok";
			case YOUTUBE -> "YouTube";
		};
	}
}
