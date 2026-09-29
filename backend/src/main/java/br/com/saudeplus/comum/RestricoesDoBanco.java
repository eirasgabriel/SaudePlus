package br.com.saudeplus.comum;

import java.util.Locale;

/**
 * Descobre qual restrição do banco uma falha de integridade violou, para a
 * API explicar o motivo certo (ex.: "você já tem consulta nesse horário" em vez
 * de "horário ocupado"). O PostgreSQL põe o nome da restrição na mensagem do erro.
 */
public final class RestricoesDoBanco {

    private RestricoesDoBanco() {
    }

    public static boolean violou(Throwable erro, String restricao) {
        String procurada = restricao.toLowerCase(Locale.ROOT);
        for (Throwable causa = erro; causa != null; causa = causa.getCause() == causa ? null : causa.getCause()) {
            if (causa instanceof org.hibernate.exception.ConstraintViolationException violacao
                    && procurada.equalsIgnoreCase(violacao.getConstraintName())) {
                return true;
            }
            String mensagem = causa.getMessage();
            if (mensagem != null && mensagem.toLowerCase(Locale.ROOT).contains(procurada)) {
                return true;
            }
        }
        return false;
    }
}
