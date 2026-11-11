package br.com.saudeplus.areaclinica;

import java.time.Clock;
import java.time.LocalDate;
import java.util.Comparator;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.UUID;

import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import br.com.saudeplus.agenda.DisponibilidadeRepository;
import br.com.saudeplus.agendamentos.AgendamentoRepository;
import br.com.saudeplus.agendamentos.StatusAgendamento;
import br.com.saudeplus.auditoria.Auditoria;
import br.com.saudeplus.clinicas.Unidade;
import br.com.saudeplus.exception.ConflitoException;
import br.com.saudeplus.exception.RecursoNaoEncontradoException;
import br.com.saudeplus.exception.RegraDeNegocioException;
import br.com.saudeplus.profissionais.Especialidade;
import br.com.saudeplus.profissionais.Medico;
import br.com.saudeplus.profissionais.MedicoRepository;

/**
 * Corpo clínico de uma unidade: a própria clínica vincula médicos já
 * cadastrados pela administração e os desvincula. A unidade sempre vem da
 * conta autenticada (ver {@link AreaClinicaController}).
 */
@Service
@Transactional(readOnly = true)
public class MedicosDaClinicaService {

    static final int LIMITE_BUSCA = 20;
    /** Consultas que ainda vão acontecer: impedem o desvínculo. */
    private static final List<StatusAgendamento> ATIVAS = List.of(StatusAgendamento.PENDENTE,
            StatusAgendamento.CONFIRMADA, StatusAgendamento.AGUARDANDO, StatusAgendamento.EM_ANDAMENTO);

    private final MedicoRepository medicos;
    private final AgendamentoRepository agendamentos;
    private final DisponibilidadeRepository disponibilidades;
    private final Auditoria auditoria;
    private final Clock relogio;

    public MedicosDaClinicaService(MedicoRepository medicos, AgendamentoRepository agendamentos,
            DisponibilidadeRepository disponibilidades, Auditoria auditoria, Clock relogio) {
        this.medicos = medicos;
        this.agendamentos = agendamentos;
        this.disponibilidades = disponibilidades;
        this.auditoria = auditoria;
        this.relogio = relogio;
    }

    public record MedicoDaUnidade(UUID id, String nome, String fotoUrl, String crm, String crmUf,
            List<String> especialidades, String status, boolean vinculado) {

        static MedicoDaUnidade de(Medico medico, boolean vinculado) {
            return new MedicoDaUnidade(medico.getId(), medico.getUsuario().getNomeCompleto(),
                    medico.getUsuario().getFotoUrl(), medico.getCrm(), medico.getCrmUf(),
                    medico.especialidadesOrdenadas().stream().map(Especialidade::getNome).toList(),
                    medico.getUsuario().getStatus().chave(), vinculado);
        }
    }

    public List<MedicoDaUnidade> vinculados(Unidade unidade) {
        return medicos.vinculadosA(unidade.getId()).stream()
                .sorted(Comparator.comparing(m -> m.getUsuario().getNomeCompleto(), String.CASE_INSENSITIVE_ORDER))
                .map(m -> MedicoDaUnidade.de(m, true)).toList();
    }

    /** Médicos com conta ativa ainda não vinculados, por nome ou CRM. */
    public List<MedicoDaUnidade> buscar(Unidade unidade, String termo) {
        String limpo = termo == null ? "" : termo.strip().replace("%", "").replace("_", "");
        if (limpo.length() < 2) {
            throw new RegraDeNegocioException("Informe pelo menos 2 caracteres para buscar.");
        }
        String padrao = "%" + limpo.toLowerCase(Locale.ROOT) + "%";
        return medicos.disponiveisPara(unidade.getId(), padrao, PageRequest.of(0, LIMITE_BUSCA)).stream()
                .map(m -> MedicoDaUnidade.de(m, false)).toList();
    }

    @Transactional
    public MedicoDaUnidade vincular(Unidade unidade, UUID medicoId) {
        Medico medico = medicos.findComUsuarioById(medicoId)
                .orElseThrow(() -> RecursoNaoEncontradoException.de("Médico", medicoId.toString()));
        if (!medico.getUsuario().ativo()) {
            throw new RegraDeNegocioException("A conta deste médico não está ativa.");
        }
        if (medico.unidadesVinculadas().stream().anyMatch(u -> u.getId().equals(unidade.getId()))) {
            throw new ConflitoException("Este médico já está vinculado à unidade.");
        }
        medico.adicionarUnidade(unidade);
        medicos.saveAndFlush(medico);
        auditoria.registrar("clinica.medico.vincular", "medico", medico.getId(), Map.of("unidadeId", unidade.getId()));
        return MedicoDaUnidade.de(medico, true);
    }

    /**
     * Retira o médico da unidade. Consultas futuras ativas impedem a operação;
     * as janelas de atendimento nessa unidade deixam de existir junto com o vínculo.
     */
    @Transactional
    public void desvincular(Unidade unidade, UUID medicoId) {
        Medico medico = medicos.findComUsuarioById(medicoId)
                .filter(m -> m.unidadesVinculadas().stream().anyMatch(u -> u.getId().equals(unidade.getId())))
                .orElseThrow(() -> RecursoNaoEncontradoException.de("Médico", medicoId.toString()));
        if (agendamentos.existsByMedicoIdAndUnidadeIdAndDataGreaterThanEqualAndStatusIn(
                medicoId, unidade.getId(), LocalDate.now(relogio), ATIVAS)) {
            throw new RegraDeNegocioException(
                    "O médico tem consultas futuras nesta unidade. Cancele ou remarque antes de desvincular.");
        }
        disponibilidades.deleteByMedicoIdAndUnidadeId(medicoId, unidade.getId());
        medico.removerUnidade(unidade);
        medicos.saveAndFlush(medico);
        auditoria.registrar("clinica.medico.desvincular", "medico", medicoId, Map.of("unidadeId", unidade.getId()));
    }
}
