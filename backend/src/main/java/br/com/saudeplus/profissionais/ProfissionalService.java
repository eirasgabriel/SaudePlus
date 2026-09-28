package br.com.saudeplus.profissionais;

import java.util.List;

import org.springframework.stereotype.Service;

import br.com.saudeplus.exception.ResourceNotFoundException;
import br.com.saudeplus.profissionais.dto.ProfissionalRequest;

@Service
public class ProfissionalService {

    private final ProfissionalRepository profissionalRepository;

    public ProfissionalService(ProfissionalRepository profissionalRepository) {
        this.profissionalRepository = profissionalRepository;
    }

    public List<Profissional> listar() {
        return profissionalRepository.findAll();
    }

    public Profissional buscarPorId(Long id) {
        return profissionalRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Profissional não encontrado: " + id));
    }

    public Profissional criar(ProfissionalRequest request) {
        Profissional profissional = new Profissional();
        aplicarCampos(profissional, request);
        return profissionalRepository.save(profissional);
    }

    public Profissional atualizar(Long id, ProfissionalRequest request) {
        Profissional profissional = buscarPorId(id);
        aplicarCampos(profissional, request);
        return profissionalRepository.save(profissional);
    }

    public void deletar(Long id) {
        profissionalRepository.delete(buscarPorId(id));
    }

    private void aplicarCampos(Profissional profissional, ProfissionalRequest request) {
        profissional.setNome(request.nome());
        profissional.setEspecialidade(request.especialidade());
        profissional.setClinica(request.clinica());
        profissional.setDisponibilidade(
                request.disponibilidade() == null || request.disponibilidade().isBlank()
                        ? "Disponível" : request.disponibilidade());
    }
}
