package br.com.saudeplus.agenda;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import java.util.UUID;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import br.com.saudeplus.agenda.CalculadoraDeHorarios.Bloqueio;
import br.com.saudeplus.agenda.CalculadoraDeHorarios.HorarioLivre;
import br.com.saudeplus.agenda.CalculadoraDeHorarios.Janela;
import br.com.saudeplus.agenda.CalculadoraDeHorarios.Ocupado;

class CalculadoraDeHorariosTest {

    /** 2026-10-05 é uma segunda-feira. */
    private static final LocalDate SEGUNDA = LocalDate.of(2026, 10, 5);
    private static final UUID UNIDADE = UUID.randomUUID();
    private static final LocalDateTime MUITO_ANTES = SEGUNDA.minusDays(10).atStartOfDay();

    private static Janela janela(DayOfWeek dia, String inicio, String fim, int duracao) {
        return new Janela(dia, LocalTime.parse(inicio), LocalTime.parse(fim), duracao, UNIDADE, Modalidade.PRESENCIAL);
    }

    private static List<String> horas(List<HorarioLivre> livres) {
        return livres.stream().map(l -> l.horario().toString()).toList();
    }

    @Test
    @DisplayName("fatia a janela pela duração, sem passar do fim")
    void fatia() {
        List<HorarioLivre> livres = CalculadoraDeHorarios.calcular(SEGUNDA, SEGUNDA,
                List.of(janela(DayOfWeek.MONDAY, "08:00", "10:00", 40)), List.of(), List.of(), MUITO_ANTES);
        // 08:00, 08:40, 09:20 — 10:00 seria o fim, e 09:20+40 = 10:00 cabe exatamente.
        assertEquals(List.of("08:00", "08:40", "09:20"), horas(livres));
    }

    @Test
    @DisplayName("só gera horários nos dias da semana da janela")
    void diaDaSemana() {
        List<HorarioLivre> livres = CalculadoraDeHorarios.calcular(SEGUNDA, SEGUNDA.plusDays(6),
                List.of(janela(DayOfWeek.WEDNESDAY, "08:00", "09:00", 30)), List.of(), List.of(), MUITO_ANTES);
        assertEquals(2, livres.size());
        assertTrue(livres.stream().allMatch(l -> l.data().getDayOfWeek() == DayOfWeek.WEDNESDAY));
    }

    @Test
    @DisplayName("tira horários que colidem com agendamento, mesmo de duração diferente")
    void ocupados() {
        List<Ocupado> ocupados = List.of(new Ocupado(SEGUNDA, LocalTime.of(8, 50), 20));
        List<HorarioLivre> livres = CalculadoraDeHorarios.calcular(SEGUNDA, SEGUNDA,
                List.of(janela(DayOfWeek.MONDAY, "08:00", "10:00", 30)), ocupados, List.of(), MUITO_ANTES);
        // 08:30–09:00 colide com 08:50–09:10; 09:00–09:30 também.
        assertEquals(List.of("08:00", "09:30"), horas(livres));
    }

    @Test
    @DisplayName("tira horários dentro de bloqueio; encostar no limite não conta")
    void bloqueios() {
        List<Bloqueio> bloqueios = List.of(new Bloqueio(SEGUNDA.atTime(9, 0), SEGUNDA.atTime(10, 0)));
        List<HorarioLivre> livres = CalculadoraDeHorarios.calcular(SEGUNDA, SEGUNDA,
                List.of(janela(DayOfWeek.MONDAY, "08:00", "11:00", 30)), List.of(), bloqueios, MUITO_ANTES);
        assertEquals(List.of("08:00", "08:30", "10:00", "10:30"), horas(livres));
    }

    @Test
    @DisplayName("não oferece horário antes do início mínimo (agora + antecedência)")
    void antecedencia() {
        List<HorarioLivre> livres = CalculadoraDeHorarios.calcular(SEGUNDA, SEGUNDA,
                List.of(janela(DayOfWeek.MONDAY, "08:00", "10:00", 30)), List.of(), List.of(), SEGUNDA.atTime(9, 0));
        assertEquals(List.of("09:00", "09:30"), horas(livres));
    }

    @Test
    @DisplayName("várias janelas no mesmo dia saem em ordem de horário")
    void ordem() {
        List<HorarioLivre> livres = CalculadoraDeHorarios.calcular(SEGUNDA, SEGUNDA,
                List.of(janela(DayOfWeek.MONDAY, "14:00", "15:00", 30), janela(DayOfWeek.MONDAY, "08:00", "09:00", 30)),
                List.of(), List.of(), MUITO_ANTES);
        assertEquals(List.of("08:00", "08:30", "14:00", "14:30"), horas(livres));
    }
}
