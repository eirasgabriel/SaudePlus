package br.com.saudeplus.agendamentos;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

/**
 * Situação de uma consulta na agenda do dia.
 *
 * A chave em minúsculo é o que trafega no JSON, para bater exatamente com o
 * `STATUS_CONSULTA` do front-end. `concluida` marca os status que contam como
 * atendimento realizado — é essa flag, e não uma lista fixa, que alimenta o
 * contador de pacientes atendidos.
 */
public enum StatusConsulta {

    REALIZADA("realizada", "Realizada", true),
    EM_ANDAMENTO("em_andamento", "Em andamento", false),
    AGUARDANDO("aguardando", "Aguardando", false),
    CONFIRMADA("confirmada", "Confirmada", false);

    private final String chave;
    private final String rotulo;
    private final boolean concluida;

    StatusConsulta(String chave, String rotulo, boolean concluida) {
        this.chave = chave;
        this.rotulo = rotulo;
        this.concluida = concluida;
    }

    @JsonValue
    public String chave() {
        return chave;
    }

    public String rotulo() {
        return rotulo;
    }

    public boolean concluida() {
        return concluida;
    }

    /** Uma consulta ainda não iniciada: nem concluída, nem em andamento. */
    public boolean pendente() {
        return !concluida && this != EM_ANDAMENTO;
    }

    @JsonCreator
    public static StatusConsulta porChave(String valor) {
        if (valor == null || valor.isBlank()) {
            return null;
        }
        for (StatusConsulta status : values()) {
            if (status.chave.equalsIgnoreCase(valor) || status.name().equalsIgnoreCase(valor)) {
                return status;
            }
        }
        throw new IllegalArgumentException("Status de consulta desconhecido: " + valor);
    }
}
