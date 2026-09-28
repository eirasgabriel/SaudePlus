package br.com.saudeplus.exames;

import java.util.List;

public interface ExameRepository {

    List<Exame> pendentesPorMedico(String medicoId);
}
