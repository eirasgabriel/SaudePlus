package br.com.saudeplus.agendamentos;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

@SpringBootTest
class AgendamentoRepositoryTest {

    @Autowired
    private AgendamentoRepository agendamentoRepository;

    @Test
    void shouldPersistAndFindAgendamentos() {
        Agendamento agendamento = new Agendamento();
        agendamento.setPacienteId(1L);
        agendamento.setProfissionalId(2L);
        agendamento.setPaciente("Maria Souza");
        agendamento.setMedico("Dr. Fernando Costa");
        agendamento.setTipo("Consulta");
        agendamento.setData("2026-10-01");
        agendamento.setHora("08:30");
        agendamento.setStatus("confirmado");

        Agendamento saved = agendamentoRepository.save(agendamento);

        assertThat(saved.getId()).isNotNull();
        assertThat(agendamentoRepository.findAll())
                .extracting(Agendamento::getPaciente)
                .contains("Maria Souza");
    }
}
