package br.com.saudeplus.areamedico;

import java.time.Clock;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import br.com.saudeplus.agendamentos.Agendamento;
import br.com.saudeplus.agendamentos.StatusAgendamento;
import br.com.saudeplus.areamedico.dto.ConsultaResposta;
import br.com.saudeplus.areamedico.dto.ExamePendenteResposta;
import br.com.saudeplus.areamedico.dto.PainelMedicoResposta;
import br.com.saudeplus.areamedico.dto.PainelMedicoResposta.MedicoDoPainel;
import br.com.saudeplus.areamedico.dto.PainelMedicoResposta.ResumoDoDia;
import br.com.saudeplus.areamedico.dto.PainelMedicoResposta.UnidadeDoPainel;
import br.com.saudeplus.clinicas.Unidade;
import br.com.saudeplus.notificacoes.NotificacaoService;
import br.com.saudeplus.profissionais.Especialidade;
import br.com.saudeplus.profissionais.Medico;
import br.com.saudeplus.security.UsuarioAutenticado;

/**
 * Monta a tela inicial do médico numa resposta só: agenda do dia, contadores,
 * pacientes recentes, exames pendentes, notificações e unidade.
 */
@Service
public class PainelMedicoService {

    /** Quantos pacientes o painel mostra antes do "Ver todos". */
    private static final int PACIENTES_NO_PAINEL = 5;
    private static final String FRASE_DO_DIA = "Cuidar de pessoas é o que nos move todos os dias.";
    private static final DateTimeFormatter HORA = DateTimeFormatter.ofPattern("HH:mm");

    private final MedicoLogado medicoLogado;
    private final AgendaDoMedicoService agenda;
    private final PacientesDoMedicoService pacientes;
    private final ExamesDoMedicoService exames;
    private final NotificacaoService notificacoes;
    private final Clock relogio;

    public PainelMedicoService(MedicoLogado medicoLogado, AgendaDoMedicoService agenda,
            PacientesDoMedicoService pacientes, ExamesDoMedicoService exames, NotificacaoService notificacoes,
            Clock relogio) {
        this.medicoLogado = medicoLogado;
        this.agenda = agenda;
        this.pacientes = pacientes;
        this.exames = exames;
        this.notificacoes = notificacoes;
        this.relogio = relogio;
    }

    /** `data` nula = hoje, no fuso de negócio. */
    @Transactional(readOnly = true)
    public PainelMedicoResposta montar(UsuarioAutenticado usuario, LocalDate data) {
        Medico medico = medicoLogado.de(usuario);
        LocalDate dia = data != null ? data : LocalDate.now(relogio);
        List<Agendamento> doDia = agenda.doDia(medico, dia);
        List<ExamePendenteResposta> examesPendentes = exames.pendentes(medico);
        return new PainelMedicoResposta(
                medicoDoPainel(medico),
                medico.unidadesAtivas().stream().findFirst().map(PainelMedicoService::unidadeDoPainel).orElse(null),
                dia,
                FRASE_DO_DIA,
                resumo(doDia, examesPendentes.size()),
                AgendaDoMedicoService.contagemPorStatus(doDia),
                doDia.stream().map(ConsultaResposta::de).toList(),
                pacientes.recentes(medico, PACIENTES_NO_PAINEL),
                examesPendentes,
                notificacoes.doUsuario(usuario.id()));
    }

    private static ResumoDoDia resumo(List<Agendamento> doDia, int examesPendentes) {
        List<Agendamento> proximas = doDia.stream().filter(a -> a.getStatus().proximo()).toList();
        return new ResumoDoDia(
                (int) doDia.stream().filter(a -> a.getStatus() != StatusAgendamento.CANCELADA).count(),
                (int) doDia.stream().filter(a -> a.getStatus().concluido()).count(),
                examesPendentes,
                proximas.size(),
                proximas.isEmpty() ? null : proximas.getFirst().getHorario().format(HORA));
    }

    private static MedicoDoPainel medicoDoPainel(Medico medico) {
        return new MedicoDoPainel(
                medico.getId(),
                medico.getUsuario().getNomeCompleto(),
                "Médico",
                medico.especialidadesOrdenadas().stream().map(Especialidade::getNome).collect(Collectors.joining(", ")),
                "CRM %s-%s".formatted(medico.getCrm(), medico.getCrmUf()),
                medico.getUsuario().getFotoUrl());
    }

    private static UnidadeDoPainel unidadeDoPainel(Unidade unidade) {
        String endereco = unidade.getBairro() == null
                ? unidade.getEndereco()
                : unidade.getEndereco() + " – " + unidade.getBairro();
        return new UnidadeDoPainel(
                unidade.getId(),
                unidade.getNome(),
                unidade.getCidade(),
                "%s, %s - %s".formatted(endereco, unidade.getCidade(), unidade.getUf()),
                unidade.getTelefone(),
                unidade.getHorarioFuncionamento(),
                unidade.getMapUrl());
    }
}
