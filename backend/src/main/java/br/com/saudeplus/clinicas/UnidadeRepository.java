package br.com.saudeplus.clinicas;

import java.util.Optional;

public interface UnidadeRepository {

    Optional<Unidade> porId(String id);
}
