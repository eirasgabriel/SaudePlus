package br.com.saudeplus.agendamentos;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface ConsultaRepository {

    /** Consultas de um profissional numa data, já ordenadas por horário. */
    List<Consulta> porMedicoEData(String medicoId, LocalDate data);

    Optional<Consulta> porId(String id);

    /** Grava a consulta, substituindo a versão anterior de mesmo id. */
    Consulta salvar(Consulta consulta);
}
