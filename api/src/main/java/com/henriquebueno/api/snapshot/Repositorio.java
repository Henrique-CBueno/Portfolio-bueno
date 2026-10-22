package com.henriquebueno.api.snapshot;

import java.util.List;

/** Repositório fixado no perfil do GitHub. */
public record Repositorio(String nome, String descricao, List<String> linguagens, String url) {
}
