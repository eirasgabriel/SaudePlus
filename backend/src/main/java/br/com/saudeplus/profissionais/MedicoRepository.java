package br.com.saudeplus.profissionais;

import java.util.Optional;

/**
 * Porta de acesso aos profissionais. A implementação atual é em memória;
 * trocar por JPA depois é substituir a classe, sem tocar nos services.
 */
public interface MedicoRepository {

    Optional<Medico> porId(String id);
}
