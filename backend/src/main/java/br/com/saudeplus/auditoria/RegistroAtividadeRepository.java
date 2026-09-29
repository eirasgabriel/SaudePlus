package br.com.saudeplus.auditoria;

import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

public interface RegistroAtividadeRepository
        extends JpaRepository<RegistroAtividade, UUID>, JpaSpecificationExecutor<RegistroAtividade> {
}
