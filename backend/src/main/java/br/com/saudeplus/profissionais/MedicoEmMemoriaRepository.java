package br.com.saudeplus.profissionais;

import java.util.List;
import java.util.Optional;

import org.springframework.stereotype.Repository;

import br.com.saudeplus.dados.DadosDemonstracao;

@Repository
public class MedicoEmMemoriaRepository implements MedicoRepository {

    private final List<Medico> medicos = DadosDemonstracao.medicos();

    @Override
    public Optional<Medico> porId(String id) {
        return medicos.stream().filter(medico -> medico.id().equals(id)).findFirst();
    }
}
