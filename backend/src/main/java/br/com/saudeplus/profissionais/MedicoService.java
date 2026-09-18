package br.com.saudeplus.profissionais;

import org.springframework.stereotype.Service;

import br.com.saudeplus.exception.RecursoNaoEncontradoException;
import br.com.saudeplus.profissionais.dto.MedicoResposta;

@Service
public class MedicoService {

    private final MedicoRepository medicos;

    public MedicoService(MedicoRepository medicos) {
        this.medicos = medicos;
    }

    public MedicoResposta porId(String id) {
        return medicos.porId(id)
                .map(MedicoResposta::de)
                .orElseThrow(() -> RecursoNaoEncontradoException.de("Médico", id));
    }
}
