package com.henriquebueno.api.admin;

import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.regex.Pattern;

import com.henriquebueno.api.snapshot.Estado;
import com.henriquebueno.api.snapshot.Repositorio;

import jakarta.enterprise.context.ApplicationScoped;

/**
 * Quais projetos aparecem em "Projetos em destaque" na home, escolhidos no painel, em ordem.
 * Cada item é "projeto:<slug>" (um dos curados do site, em site/src/dados/projetos.ts) ou "github:<nome>" (um repositório
 * público). A API não conhece os curados (eles vivem no código do site): confere só o formato do slug; o site ignora
 * slug que não existir. Repositório do GitHub tem que existir entre os públicos lidos.
 */
@ApplicationScoped
public class Destaques {

	static final int MAXIMO = 6;
	private static final Pattern PROJETO = Pattern.compile("projeto:[a-z0-9-]{1,60}");

	/** O que o painel recebe: a seleção atual (nula = padrão) e os repositórios que podem entrar. */
	public record NoPainel(List<String> selecao, List<Repositorio> repositorios) {
	}

	private final Estado estado;

	Destaques(Estado estado) {
		this.estado = estado;
	}

	public NoPainel noPainel() {
		var atual = estado.atual();
		return new NoPainel(atual.destaques(), atual.publicos());
	}

	/** {@code null} volta ao padrão (todos os curados, na ordem do código). */
	public synchronized List<String> escolher(List<String> selecao) {
		if (selecao != null) validar(selecao);
		estado.atualizarDestaques(selecao);
		return selecao;
	}

	private void validar(List<String> selecao) {
		if (selecao.size() > MAXIMO) throw new Invalido(Map.of("selecao", "no máximo " + MAXIMO + " projetos em destaque"));
		if (new HashSet<>(selecao).size() != selecao.size()) throw new Invalido(Map.of("selecao", "o mesmo projeto apareceu duas vezes"));
		var publicos = estado.atual().publicos().stream().map(Repositorio::nome).toList();
		for (var item : selecao) {
			if (item == null) throw new Invalido(Map.of("selecao", "item vazio"));
			if (item.startsWith("github:")) {
				if (!publicos.contains(item.substring("github:".length()))) {
					throw new Invalido(Map.of("selecao", "repositório não encontrado no GitHub: " + item.substring("github:".length())));
				}
			} else if (!PROJETO.matcher(item).matches()) {
				throw new Invalido(Map.of("selecao", "item desconhecido: " + item));
			}
		}
	}
}
