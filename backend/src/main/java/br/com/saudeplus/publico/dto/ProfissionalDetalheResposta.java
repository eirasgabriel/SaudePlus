package br.com.saudeplus.publico.dto;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

import br.com.saudeplus.agenda.Modalidade;
import br.com.saudeplus.publico.dto.ProfissionalResumoResposta.EspecialidadeResumo;

/** Perfil completo do médico, com todas as unidades onde atende. */
public record ProfissionalDetalheResposta(
        UUID id,
        String nome,
        String fotoUrl,
        String crm,
        String crmUf,
        String bio,
        List<EspecialidadeResumo> especialidades,
        BigDecimal nota,
        int avaliacoes,
        List<UnidadePublicaResposta> unidades,
        List<Modalidade> modalidades,
        List<String> convenios,
        BigDecimal valorConsulta) {
}
