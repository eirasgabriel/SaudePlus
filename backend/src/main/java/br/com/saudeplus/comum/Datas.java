package br.com.saudeplus.comum;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;

/** Datas por extenso, do jeito que as telas mostram. */
public final class Datas {

    private static final DateTimeFormatter DIA = DateTimeFormatter.ofPattern("dd/MM");

    private Datas() {
    }

    /** "Hoje", "Amanhã", "12/10" ou "Sem prazo". */
    public static String prazoPorExtenso(LocalDate prazo, LocalDate hoje) {
        if (prazo == null) {
            return "Sem prazo";
        }
        if (prazo.equals(hoje)) {
            return "Hoje";
        }
        if (prazo.equals(hoje.plusDays(1))) {
            return "Amanhã";
        }
        return prazo.format(DIA);
    }
}
