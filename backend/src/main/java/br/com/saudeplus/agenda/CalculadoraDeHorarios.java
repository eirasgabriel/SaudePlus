package br.com.saudeplus.agenda;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.UUID;

/**
 * Horários livres de um médico: as janelas semanais fatiadas pela duração,
 * menos o que já passou (ou está perto demais), os bloqueios e os horários
 * ocupados por agendamentos.
 *
 * Função pura, sem banco nem relógio: quem chama entrega tudo, inclusive o
 * "agora". É o que permite testar cada regra isoladamente.
 */
public final class CalculadoraDeHorarios {

    private CalculadoraDeHorarios() {
    }

    /** Janela semanal de atendimento. */
    public record Janela(DayOfWeek dia, LocalTime inicio, LocalTime fim, int duracaoMin, UUID unidadeId,
            Modalidade modalidade) {
    }

    /** Horário já tomado. */
    public record Ocupado(LocalDate data, LocalTime inicio, int duracaoMin) {

        LocalDateTime comeco() {
            return LocalDateTime.of(data, inicio);
        }

        LocalDateTime termino() {
            return comeco().plusMinutes(duracaoMin);
        }
    }

    /** Período sem atendimento, em horário local. */
    public record Bloqueio(LocalDateTime inicio, LocalDateTime fim) {
    }

    public record HorarioLivre(LocalDate data, LocalTime horario, int duracaoMin, UUID unidadeId,
            Modalidade modalidade) {
    }

    /**
     * @param de primeiro dia (inclusive)
     * @param ate último dia (inclusive)
     * @param inicioMinimo nada começa antes disto ("agora" + antecedência mínima)
     */
    public static List<HorarioLivre> calcular(LocalDate de, LocalDate ate, List<Janela> janelas,
            List<Ocupado> ocupados, List<Bloqueio> bloqueios, LocalDateTime inicioMinimo) {
        List<HorarioLivre> livres = new ArrayList<>();
        for (LocalDate dia = de; !dia.isAfter(ate); dia = dia.plusDays(1)) {
            for (Janela janela : janelas) {
                if (janela.dia() == dia.getDayOfWeek()) {
                    fatiar(dia, janela, ocupados, bloqueios, inicioMinimo, livres);
                }
            }
        }
        livres.sort(Comparator.comparing(HorarioLivre::data).thenComparing(HorarioLivre::horario));
        return livres;
    }

    private static void fatiar(LocalDate dia, Janela janela, List<Ocupado> ocupados, List<Bloqueio> bloqueios,
            LocalDateTime inicioMinimo, List<HorarioLivre> livres) {
        LocalDateTime fimDaJanela = LocalDateTime.of(dia, janela.fim());
        LocalDateTime inicio = LocalDateTime.of(dia, janela.inicio());
        while (!inicio.plusMinutes(janela.duracaoMin()).isAfter(fimDaJanela)) {
            LocalDateTime fim = inicio.plusMinutes(janela.duracaoMin());
            if (!inicio.isBefore(inicioMinimo) && livreDeOcupacao(inicio, fim, ocupados)
                    && livreDeBloqueio(inicio, fim, bloqueios)) {
                livres.add(new HorarioLivre(dia, inicio.toLocalTime(), janela.duracaoMin(), janela.unidadeId(),
                        janela.modalidade()));
            }
            inicio = fim;
        }
    }

    private static boolean livreDeOcupacao(LocalDateTime inicio, LocalDateTime fim, List<Ocupado> ocupados) {
        return ocupados.stream().noneMatch(o -> o.comeco().isBefore(fim) && inicio.isBefore(o.termino()));
    }

    private static boolean livreDeBloqueio(LocalDateTime inicio, LocalDateTime fim, List<Bloqueio> bloqueios) {
        return bloqueios.stream().noneMatch(b -> b.inicio().isBefore(fim) && inicio.isBefore(b.fim()));
    }
}
