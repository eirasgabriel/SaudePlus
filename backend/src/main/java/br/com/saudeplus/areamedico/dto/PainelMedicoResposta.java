package br.com.saudeplus.areamedico.dto;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import br.com.saudeplus.notificacoes.dto.NotificacaoResposta;

/**
 * A tela inicial do médico numa resposta só. O formato é o mesmo que o
 * `DashboardMedico` do front já consome; `unidade` pode vir nula se o médico
 * ainda não foi vinculado a nenhuma unidade.
 */
public record PainelMedicoResposta(
        MedicoDoPainel medico,
        UnidadeDoPainel unidade,
        LocalDate dataReferencia,
        String fraseDoDia,
        ResumoDoDia resumo,
        Map<String, Integer> contagemPorStatus,
        List<ConsultaResposta> agenda,
        List<PacienteResumoResposta> pacientes,
        List<ExamePendenteResposta> examesPendentes,
        List<NotificacaoResposta> notificacoes) {

    public record MedicoDoPainel(UUID id, String nome, String perfil, String especialidade, String crm,
            String avatarUrl) {
    }

    public record UnidadeDoPainel(UUID id, String nome, String cidade, String endereco, String telefone,
            String horario, String mapUrl) {
    }

    /**
     * Os contadores do topo. Consultas canceladas não contam em `consultasHoje`.
     *
     * @param primeiroHorarioPendente `HH:mm` da próxima consulta que ainda não começou, ou nulo
     */
    public record ResumoDoDia(int consultasHoje, int pacientesAtendidos, int examesPendentes,
            int proximasConsultas, String primeiroHorarioPendente) {
    }
}
