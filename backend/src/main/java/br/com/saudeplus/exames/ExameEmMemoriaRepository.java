package br.com.saudeplus.exames;

import java.util.List;

import org.springframework.stereotype.Repository;

import br.com.saudeplus.dados.DadosDemonstracao;

@Repository
public class ExameEmMemoriaRepository implements ExameRepository {

    private final List<Exame> exames = DadosDemonstracao.exames();

    @Override
    public List<Exame> pendentesPorMedico(String medicoId) {
        return exames.stream().filter(exame -> exame.medicoId().equals(medicoId)).toList();
    }
}
