package br.com.saudeplus.exames;

import java.util.List;

import org.springframework.stereotype.Service;

import br.com.saudeplus.exames.dto.ExameRequest;
import br.com.saudeplus.exception.ResourceNotFoundException;

@Service
public class ExameService {

    private final ExameRepository exameRepository;

    public ExameService(ExameRepository exameRepository) {
        this.exameRepository = exameRepository;
    }

    public List<Exame> listar() {
        return exameRepository.findAll();
    }

    public Exame buscarPorId(Long id) {
        return exameRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Exame não encontrado: " + id));
    }

    public Exame criar(ExameRequest request) {
        Exame exame = new Exame();
        aplicarCampos(exame, request);
        return exameRepository.save(exame);
    }

    public Exame atualizar(Long id, ExameRequest request) {
        Exame exame = buscarPorId(id);
        aplicarCampos(exame, request);
        return exameRepository.save(exame);
    }

    public void deletar(Long id) {
        exameRepository.delete(buscarPorId(id));
    }

    private void aplicarCampos(Exame exame, ExameRequest request) {
        exame.setNome(request.nome());
        exame.setCategoria(request.categoria());
        exame.setDuracaoMinutos(request.duracaoMinutos());
        exame.setDisponivel(request.disponivel() == null || request.disponivel());
    }
}
