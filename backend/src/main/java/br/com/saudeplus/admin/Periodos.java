package br.com.saudeplus.admin;

import java.time.Clock;
import java.time.Instant;
import java.time.LocalDate;
import java.time.YearMonth;

/** Limites de mês no fuso de negócio, para as contagens "no mês" da administração. */
final class Periodos {

    private Periodos() {
    }

    static YearMonth mesAtual(Clock relogio) {
        return YearMonth.now(relogio);
    }

    static Instant inicio(YearMonth mes, Clock relogio) {
        return mes.atDay(1).atStartOfDay(relogio.getZone()).toInstant();
    }

    /** Primeiro instante do mês seguinte (limite exclusivo). */
    static Instant fim(YearMonth mes, Clock relogio) {
        return inicio(mes.plusMonths(1), relogio);
    }

    static LocalDate primeiroDia(YearMonth mes) {
        return mes.atDay(1);
    }

    static LocalDate ultimoDia(YearMonth mes) {
        return mes.atEndOfMonth();
    }
}
