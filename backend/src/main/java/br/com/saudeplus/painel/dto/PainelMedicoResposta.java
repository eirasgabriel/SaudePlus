package br.com.saudeplus.painel.dto;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

import br.com.saudeplus.agendamentos.dto.ConsultaResposta;
import br.com.saudeplus.clinicas.dto.UnidadeResposta;
import br.com.saudeplus.exames.dto.ExameResposta;
import br.com.saudeplus.notificacoes.dto.NotificacaoResposta;
import br.com.saudeplus.pacientes.dto.PacienteResposta;
import br.com.saudeplus.profissionais.dto.MedicoResposta;

/**
 * Tudo o que a tela do painel precisa, numa requisição só.
 *
 * O painel é uma leitura única de várias listas pequenas; quebrar isso em
 * seis chamadas deixaria a tela montando aos pedaços sem ganho nenhum. Os
 * endpoints individuais continuam existindo para uso pontual, como recarregar
 * só a agenda depois de mudar um status.
 */
public record PainelMedicoResposta(
        MedicoResposta medico,
        UnidadeResposta unidade,
        LocalDate dataReferencia,
        String fraseDoDia,
        ResumoDoDiaResposta resumo,
        Map<String, Integer> contagemPorStatus,
        List<ConsultaResposta> agenda,
        List<PacienteResposta> pacientes,
        List<ExameResposta> examesPendentes,
        List<NotificacaoResposta> notificacoes) {
}
