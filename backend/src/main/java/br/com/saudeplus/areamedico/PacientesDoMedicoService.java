package br.com.saudeplus.areamedico;

import java.time.Clock;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import java.util.function.Function;
import java.util.stream.Collectors;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import br.com.saudeplus.agendamentos.Agendamento;
import br.com.saudeplus.agendamentos.AgendamentoRepository;
import br.com.saudeplus.areamedico.dto.PacienteDetalheResposta;
import br.com.saudeplus.areamedico.dto.PacienteResumoResposta;
import br.com.saudeplus.auditoria.Auditoria;
import br.com.saudeplus.comum.Nomes;
import br.com.saudeplus.comum.Pagina;
import br.com.saudeplus.exames.ExameRepository;
import br.com.saudeplus.exception.RecursoNaoEncontradoException;
import br.com.saudeplus.pacientes.Paciente;
import br.com.saudeplus.pacientes.PacienteRepository;
import br.com.saudeplus.profissionais.Medico;
import br.com.saudeplus.security.UsuarioAutenticado;

/**
 * Pacientes do médico: só quem tem ou teve agendamento com ele. Um paciente
 * sem vínculo não aparece na lista e a ficha dele dá 404.
 */
@Service
public class PacientesDoMedicoService {

    private static final DateTimeFormatter HORA = DateTimeFormatter.ofPattern("HH:mm");
    static final int TAMANHO_MAXIMO = 50;

    private final MedicoLogado medicoLogado;
    private final PacienteRepository pacientes;
    private final AgendamentoRepository agendamentos;
    private final ExameRepository exames;
    private final Auditoria auditoria;
    private final Clock relogio;

    public PacientesDoMedicoService(MedicoLogado medicoLogado, PacienteRepository pacientes,
            AgendamentoRepository agendamentos, ExameRepository exames, Auditoria auditoria, Clock relogio) {
        this.medicoLogado = medicoLogado;
        this.pacientes = pacientes;
        this.agendamentos = agendamentos;
        this.exames = exames;
        this.auditoria = auditoria;
        this.relogio = relogio;
    }

    @Transactional(readOnly = true)
    public Pagina<PacienteResumoResposta> listar(UsuarioAutenticado usuario, String termo, int pagina, int tamanho) {
        Medico medico = medicoLogado.de(usuario);
        String padrao = termo == null || termo.isBlank()
                ? "%"
                : "%" + termo.strip().toLowerCase(Locale.ROOT).replace("%", "").replace("_", "") + "%";
        Page<Paciente> encontrados = pacientes.atendidosPeloMedico(medico.getId(), padrao,
                PageRequest.of(Math.max(pagina, 0), Math.clamp(tamanho, 1, TAMANHO_MAXIMO)));

        List<UUID> ids = encontrados.getContent().stream().map(Paciente::getId).toList();
        Map<UUID, Agendamento> ultimos = ids.isEmpty() ? Map.of()
                : agendamentos.findByMedicoIdAndPacienteIdIn(medico.getId(), ids).stream()
                        .collect(Collectors.toMap(a -> a.getPaciente().getId(), Function.identity(),
                                (a, b) -> a.inicio().isAfter(b.inicio()) ? a : b));
        return Pagina.de(encontrados, paciente -> resumo(paciente, Optional.ofNullable(ultimos.get(paciente.getId()))));
    }

    /**
     * Ficha com histórico e exames. Abrir a ficha fica na auditoria: é dado de
     * saúde de outra pessoa (LGPD, art. 37). Não é `readOnly` porque grava esse registro.
     */
    @Transactional
    public PacienteDetalheResposta detalhe(UsuarioAutenticado usuario, UUID pacienteId) {
        Medico medico = medicoLogado.de(usuario);
        List<Agendamento> historico = agendamentos.findByMedicoIdAndPacienteIdOrderByDataDescHorarioDesc(
                medico.getId(), pacienteId);
        if (historico.isEmpty()) {
            throw RecursoNaoEncontradoException.de("Paciente", pacienteId.toString());
        }
        auditoria.registrar("paciente.ficha.ver", "paciente", pacienteId, Map.of());
        Paciente paciente = historico.getFirst().getPaciente();
        return new PacienteDetalheResposta(
                paciente.getId(),
                paciente.getUsuario().getNomeCompleto(),
                Nomes.iniciais(paciente.getUsuario().getNomeCompleto()),
                paciente.idadeEm(LocalDate.now(relogio)),
                paciente.getDataNascimento(),
                paciente.getUsuario().getTelefone(),
                paciente.getUsuario().getEmail(),
                historico.stream().map(a -> new PacienteDetalheResposta.Consulta(
                        a.getId(), a.getData(), a.getHorario().format(HORA), a.getTipo(), a.descricao(),
                        a.getStatus(), a.getResumo(), a.getDesfecho())).toList(),
                exames.findByPacienteIdAndMedicoSolicitanteIdOrderByCriadoEmDesc(pacienteId, medico.getId()).stream()
                        .map(e -> new PacienteDetalheResposta.Exame(e.getId(), e.getTipo().getNome(), e.getStatus(),
                                e.getPrazo()))
                        .toList());
    }

    /** Os pacientes mais recentes (até `limite`), a partir das últimas consultas até hoje. */
    List<PacienteResumoResposta> recentes(Medico medico, int limite) {
        List<Agendamento> ultimos = agendamentos.findByMedicoIdAndDataLessThanEqualOrderByDataDescHorarioDesc(
                medico.getId(), LocalDate.now(relogio), PageRequest.of(0, limite * 10));
        return ultimos.stream()
                .collect(Collectors.toMap(a -> a.getPaciente().getId(), Function.identity(), (a, b) -> a,
                        LinkedHashMap::new))
                .values().stream()
                .sorted(Comparator.comparing(Agendamento::inicio).reversed())
                .limit(limite)
                .map(a -> resumo(a.getPaciente(), Optional.of(a)))
                .toList();
    }

    private PacienteResumoResposta resumo(Paciente paciente, Optional<Agendamento> ultimo) {
        String nome = paciente.getUsuario().getNomeCompleto();
        return new PacienteResumoResposta(
                paciente.getId(),
                nome,
                paciente.idadeEm(LocalDate.now(relogio)),
                ultimo.map(Agendamento::descricao).orElse(null),
                Nomes.iniciais(nome),
                ultimo.map(Agendamento::getData).orElse(null));
    }
}
