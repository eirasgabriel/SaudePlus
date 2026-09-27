package br.com.saudeplus.painel;

import java.time.LocalDate;
import java.util.List;

import org.springframework.stereotype.Service;

import br.com.saudeplus.agendamentos.AgendaService;
import br.com.saudeplus.agendamentos.Consulta;
import br.com.saudeplus.clinicas.Unidade;
import br.com.saudeplus.clinicas.UnidadeRepository;
import br.com.saudeplus.clinicas.dto.UnidadeResposta;
import br.com.saudeplus.dados.DadosDemonstracao;
import br.com.saudeplus.exames.ExameService;
import br.com.saudeplus.exames.dto.ExameResposta;
import br.com.saudeplus.exception.RecursoNaoEncontradoException;
import br.com.saudeplus.notificacoes.NotificacaoService;
import br.com.saudeplus.pacientes.PacienteService;
import br.com.saudeplus.painel.dto.PainelMedicoResposta;
import br.com.saudeplus.painel.dto.ResumoDoDiaResposta;
import br.com.saudeplus.profissionais.Medico;
import br.com.saudeplus.profissionais.MedicoRepository;
import br.com.saudeplus.profissionais.dto.MedicoResposta;

/**
 * Monta o painel do profissional juntando agenda, pacientes, exames,
 * notificações e unidade numa resposta só.
 *
 * O serviço não conhece as fontes: conversa com os outros services e com os
 * repositórios pelas interfaces, então trocar a memória por banco depois não
 * muda nada aqui.
 */
@Service
public class PainelMedicoService {

    /** Quantos pacientes o painel mostra antes do "Ver todos". */
    private static final int PACIENTES_NO_PAINEL = 5;

    private final MedicoRepository medicos;
    private final UnidadeRepository unidades;
    private final AgendaService agenda;
    private final PacienteService pacientes;
    private final ExameService exames;
    private final NotificacaoService notificacoes;

    public PainelMedicoService(
            MedicoRepository medicos,
            UnidadeRepository unidades,
            AgendaService agenda,
            PacienteService pacientes,
            ExameService exames,
            NotificacaoService notificacoes) {
        this.medicos = medicos;
        this.unidades = unidades;
        this.agenda = agenda;
        this.pacientes = pacientes;
        this.exames = exames;
        this.notificacoes = notificacoes;
    }

    public PainelMedicoResposta montar(String medicoId, LocalDate data) {
        Medico medico = medicos.porId(medicoId)
                .orElseThrow(() -> RecursoNaoEncontradoException.de("Médico", medicoId));

        LocalDate dia = data != null ? data : DadosDemonstracao.DATA_REFERENCIA;

        Unidade unidade = unidades.porId(medico.unidadeId())
                .orElseThrow(() -> RecursoNaoEncontradoException.de("Unidade", medico.unidadeId()));

        List<ExameResposta> examesPendentes = exames.pendentesDoMedico(medicoId);

        return new PainelMedicoResposta(
                MedicoResposta.de(medico),
                UnidadeResposta.de(unidade),
                dia,
                DadosDemonstracao.FRASE_DO_DIA,
                resumo(medicoId, dia, examesPendentes.size()),
                agenda.contagemPorStatus(medicoId, dia),
                agenda.agendaDoDia(medicoId, dia, null),
                pacientes.doMedico(medicoId, PACIENTES_NO_PAINEL),
                examesPendentes,
                notificacoes.doMedico(medicoId));
    }

    /** Os quatro contadores do topo, todos derivados dos dados do dia. */
    public ResumoDoDiaResposta resumo(String medicoId, LocalDate data, int totalDeExames) {
        List<Consulta> pendentes = agenda.pendentes(medicoId, data);
        String primeiroHorario = pendentes.isEmpty()
                ? null
                : pendentes.get(0).horario().toString();

        return new ResumoDoDiaResposta(
                agenda.totalDoDia(medicoId, data),
                agenda.atendidas(medicoId, data),
                totalDeExames,
                pendentes.size(),
                primeiroHorario);
    }
}
