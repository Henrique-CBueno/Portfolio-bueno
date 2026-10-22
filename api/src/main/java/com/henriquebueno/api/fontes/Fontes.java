package com.henriquebueno.api.fontes;

import java.util.List;

import com.henriquebueno.api.snapshot.Contagem;
import com.henriquebueno.api.snapshot.Rede;
import com.henriquebueno.api.snapshot.Repositorio;

/** O que vem de fora automaticamente: números do YouTube e repositórios fixados do GitHub. */
public final class Fontes {

	private Fontes() {
	}

	public interface DeContagem {
		Rede rede();

		Contagem ler();
	}

	public interface DeRepositorios {
		List<Repositorio> fixados();
	}
}
