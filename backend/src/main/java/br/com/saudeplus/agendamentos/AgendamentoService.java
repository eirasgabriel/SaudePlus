package br.com.saudeplus.agendamentos;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

import org.springframework.stereotype.Service;

import br.com.saudeplus.agendamentos.dto.AgendamentoRequest;
import br.com.saudeplus.exception.ResourceNotFoundException;
import br.com.saudeplus.profissionais.Profissional;
import br.com.saudeplus.profissionais.ProfissionalRepository;

@Service
public class AgendamentoService {

    private final AgendamentoRepository agendamentoRepository;
    private final ProfissionalRepository profissionalRepository;

    public AgendamentoService(AgendamentoRepository agendamentoRepository,
                               ProfissionalRepository profissionalRepository) {
        this.agendamentoRepository = agendamentoRepository;
        this.profissionalRepository = profissionalRepository;
    }

    public List<Map<String, Object>> listar() {
        return agendamentoRepository.findAll().stream()
                .map(this::toMap)
                .toList();
    }

    public Map<String, Object> buscarPorId(Long id) {
        return toMap(buscarEntidade(id));
    }

    public Map<String, Object> criar(AgendamentoRequest request) {
        Profissional profissional = buscarProfissional(request.profissionalId());

        Agendamento agendamento = new Agendamento();
        agendamento.setProfissionalId(profissional.getId());
        agendamento.setPaciente(request.paciente());
        agendamento.setMedico(profissional.getNome());
        agendamento.setData(request.data());
        agendamento.setHora(request.hora());
        agendamento.setTipo(request.tipo());
        agendamento.setStatus(request.status() == null || request.status().isBlank() ? "pendente" : request.status());

        Agendamento salvo = agendamentoRepository.save(agendamento);
        return toMap(salvo);
    }

    public Map<String, Object> atualizar(Long id, AgendamentoRequest request) {
        Agendamento agendamento = buscarEntidade(id);
        Profissional profissional = buscarProfissional(request.profissionalId());

        agendamento.setProfissionalId(profissional.getId());
        agendamento.setPaciente(request.paciente());
        agendamento.setMedico(profissional.getNome());
        agendamento.setData(request.data());
        agendamento.setHora(request.hora());
        agendamento.setTipo(request.tipo());
        if (request.status() != null && !request.status().isBlank()) {
            agendamento.setStatus(request.status());
        }

        return toMap(agendamentoRepository.save(agendamento));
    }

    public Map<String, Object> atualizarStatus(Long id, String status) {
        Agendamento agendamento = buscarEntidade(id);
        agendamento.setStatus(status);
        return toMap(agendamentoRepository.save(agendamento));
    }

    public void deletar(Long id) {
        agendamentoRepository.delete(buscarEntidade(id));
    }

    private Profissional buscarProfissional(Long profissionalId) {
        return profissionalRepository.findById(profissionalId)
                .orElseThrow(() -> new ResourceNotFoundException("Profissional não encontrado: " + profissionalId));
    }

    private Agendamento buscarEntidade(Long id) {
        return agendamentoRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Agendamento não encontrado: " + id));
    }

    private Map<String, Object> toMap(Agendamento agendamento) {
        Map<String, Object> item = new LinkedHashMap<>();
        item.put("id", agendamento.getId());
        item.put("pacienteId", agendamento.getPacienteId());
        item.put("profissionalId", agendamento.getProfissionalId());
        item.put("paciente", agendamento.getPaciente());
        item.put("medico", agendamento.getMedico());
        item.put("data", agendamento.getData());
        item.put("hora", agendamento.getHora());
        item.put("tipo", agendamento.getTipo());
        item.put("status", agendamento.getStatus());
        return item;
    }
}
