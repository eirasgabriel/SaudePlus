package br.com.saudeplus.clinicas;

import java.util.List;

import org.springframework.stereotype.Service;

import br.com.saudeplus.clinicas.dto.ClinicaRequest;
import br.com.saudeplus.exception.ResourceNotFoundException;

@Service
public class ClinicaService {

    private final ClinicaRepository clinicaRepository;

    public ClinicaService(ClinicaRepository clinicaRepository) {
        this.clinicaRepository = clinicaRepository;
    }

    public List<Clinica> listar() {
        return clinicaRepository.findAll();
    }

    public Clinica buscarPorId(Long id) {
        return clinicaRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Clínica não encontrada: " + id));
    }

    public Clinica criar(ClinicaRequest request) {
        Clinica clinica = new Clinica();
        aplicarCampos(clinica, request);
        return clinicaRepository.save(clinica);
    }

    public Clinica atualizar(Long id, ClinicaRequest request) {
        Clinica clinica = buscarPorId(id);
        aplicarCampos(clinica, request);
        return clinicaRepository.save(clinica);
    }

    public void deletar(Long id) {
        clinicaRepository.delete(buscarPorId(id));
    }

    private void aplicarCampos(Clinica clinica, ClinicaRequest request) {
        clinica.setNome(request.nome());
        clinica.setEspecialidade(request.especialidade());
        clinica.setEndereco(request.endereco());
        clinica.setCidade(request.cidade());
        clinica.setTelefone(request.telefone());
        clinica.setStatus(request.status() == null || request.status().isBlank() ? "ativa" : request.status());

        if (request.cnpj() != null && !request.cnpj().isBlank()) {
            clinica.setCnpj(request.cnpj());
        }
        if (request.unidade() != null && !request.unidade().isBlank()) {
            clinica.setUnidade(request.unidade());
        }
        if (request.email() != null && !request.email().isBlank()) {
            clinica.setEmail(request.email());
        }
        if (request.horarioFuncionamento() != null && !request.horarioFuncionamento().isBlank()) {
            clinica.setHorarioFuncionamento(request.horarioFuncionamento());
        }
    }
}
