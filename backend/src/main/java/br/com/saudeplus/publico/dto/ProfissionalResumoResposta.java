package br.com.saudeplus.publico.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

import br.com.saudeplus.agenda.Modalidade;

/**
 * Cartão de um médico na lista da busca.
 *
 * @param local a unidade mostrada no cartão: a da cidade filtrada, ou a primeira em funcionamento
 * @param proximaData primeiro dia com horário livre (até duas semanas à frente), ou nulo
 * @param proximosHorarios os primeiros horários livres desse dia (`HH:mm`)
 */
public record ProfissionalResumoResposta(
        UUID id,
        String nome,
        String fotoUrl,
        String crm,
        String crmUf,
        List<EspecialidadeResumo> especialidades,
        BigDecimal nota,
        int avaliacoes,
        UnidadePublicaResposta local,
        List<Modalidade> modalidades,
        List<String> convenios,
        BigDecimal valorConsulta,
        LocalDate proximaData,
        List<String> proximosHorarios) {

    public record EspecialidadeResumo(String slug, String nome) {
    }
}
