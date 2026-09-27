package br.com.saudeplus.agendamentos;

import java.time.LocalDate;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

import org.springframework.stereotype.Service;

import br.com.saudeplus.agendamentos.dto.ConsultaResposta;
import br.com.saudeplus.exception.RecursoNaoEncontradoException;
import br.com.saudeplus.pacientes.Paciente;
import br.com.saudeplus.pacientes.PacienteRepository;

/**
 * Regras da agenda do dia.
 *
 * É aqui que moram as definições dos contadores do painel — as mesmas que o
 * front-end aplica em `selectors.js`. Mudou a regra de "paciente atendido"?
 * Muda neste arquivo, e a tela acompanha.
 */
@Service
public class AgendaService {

    private final ConsultaRepository consultas;
    private final PacienteRepository pacientes;

    public AgendaService(ConsultaRepository consultas, PacienteRepository pacientes) {
        this.consultas = consultas;
        this.pacientes = pacientes;
    }

    /** Agenda do dia, opcionalmente filtrada por status. */
    public List<ConsultaResposta> agendaDoDia(String medicoId, LocalDate data, StatusConsulta filtro) {
        return consultas.porMedicoEData(medicoId, data).stream()
                .filter(consulta -> filtro == null || consulta.status() == filtro)
                .map(this::paraResposta)
                .toList();
    }

    /** Quantas consultas há em cada status, na ordem do enum. */
    public Map<String, Integer> contagemPorStatus(String medicoId, LocalDate data) {
        List<Consulta> doDia = consultas.porMedicoEData(medicoId, data);
        Map<String, Integer> contagem = new LinkedHashMap<>();
        for (StatusConsulta status : StatusConsulta.values()) {
            contagem.put(status.chave(), (int) doDia.stream().filter(c -> c.status() == status).count());
        }
        return contagem;
    }

    public int totalDoDia(String medicoId, LocalDate data) {
        return consultas.porMedicoEData(medicoId, data).size();
    }

    /** Consultas já concluídas — alimenta "pacientes atendidos". */
    public int atendidas(String medicoId, LocalDate data) {
        return (int) consultas.porMedicoEData(medicoId, data).stream()
                .filter(consulta -> consulta.status().concluida())
                .count();
    }

    /** Consultas que ainda não começaram, na ordem do dia. */
    public List<Consulta> pendentes(String medicoId, LocalDate data) {
        return consultas.porMedicoEData(medicoId, data).stream()
                .filter(consulta -> consulta.status().pendente())
                .toList();
    }

    /** Troca o status de uma consulta e devolve a versão atualizada. */
    public ConsultaResposta atualizarStatus(String consultaId, StatusConsulta novoStatus) {
        Consulta consulta = consultas.porId(consultaId)
                .orElseThrow(() -> RecursoNaoEncontradoException.de("Consulta", consultaId));
        return paraResposta(consultas.salvar(consulta.comStatus(novoStatus)));
    }

    private ConsultaResposta paraResposta(Consulta consulta) {
        String nome = pacientes.porId(consulta.pacienteId())
                .map(Paciente::nome)
                .orElse("Paciente");
        return ConsultaResposta.de(consulta, nome);
    }
}
