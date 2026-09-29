package br.com.saudeplus.agendamentos;

import java.util.EnumSet;
import java.util.Set;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

import br.com.saudeplus.comum.ConversorDeChave;
import br.com.saudeplus.comum.EnumComChave;
import jakarta.persistence.Converter;

/**
 * Situação única de um agendamento, usada por paciente, médico e admin.
 *
 * A chave minúscula é o que trafega no JSON e no banco. As transições
 * permitidas moram aqui, e não nos services: nenhum caminho do sistema
 * consegue, por exemplo, reabrir uma consulta cancelada.
 */
public enum StatusAgendamento implements EnumComChave {
    /** Reservado pelo paciente, esperando confirmação. */
    PENDENTE("pendente", "Pendente"),
    CONFIRMADA("confirmada", "Confirmada"),
    /** Paciente fez o check-in e está na sala de espera. */
    AGUARDANDO("aguardando", "Aguardando"),
    EM_ANDAMENTO("em_andamento", "Em andamento"),
    REALIZADA("realizada", "Realizada"),
    CANCELADA("cancelada", "Cancelada"),
    /** Paciente não compareceu. */
    FALTOU("faltou", "Não compareceu");

    private final String chave;
    private final String rotulo;

    StatusAgendamento(String chave, String rotulo) {
        this.chave = chave;
        this.rotulo = rotulo;
    }

    /** Para onde cada status pode ir. Estados finais não têm saída. */
    public Set<StatusAgendamento> seguintes() {
        return switch (this) {
            case PENDENTE -> EnumSet.of(CONFIRMADA, CANCELADA);
            case CONFIRMADA -> EnumSet.of(AGUARDANDO, CANCELADA, FALTOU);
            case AGUARDANDO -> EnumSet.of(EM_ANDAMENTO);
            case EM_ANDAMENTO -> EnumSet.of(REALIZADA);
            case REALIZADA, CANCELADA, FALTOU -> EnumSet.noneOf(StatusAgendamento.class);
        };
    }

    public boolean podeIrPara(StatusAgendamento novo) {
        return seguintes().contains(novo);
    }

    /** Ocupa o horário do médico. Cancelada e falta liberam o horário. */
    public boolean ocupaHorario() {
        return this != CANCELADA && this != FALTOU;
    }

    /** Ainda vai acontecer: entra em "próximas consultas". */
    public boolean proximo() {
        return this == PENDENTE || this == CONFIRMADA || this == AGUARDANDO;
    }

    /** Conta como paciente atendido. */
    public boolean concluido() {
        return this == REALIZADA;
    }

    public static Set<StatusAgendamento> queOcupamHorario() {
        return EnumSet.of(PENDENTE, CONFIRMADA, AGUARDANDO, EM_ANDAMENTO, REALIZADA);
    }

    @Override
    @JsonValue
    public String chave() {
        return chave;
    }

    public String rotulo() {
        return rotulo;
    }

    /** Aceita a chave (`em_andamento`) ou o nome da constante (`EM_ANDAMENTO`). */
    @JsonCreator
    public static StatusAgendamento porChave(String valor) {
        if (valor == null || valor.isBlank()) {
            return null;
        }
        for (StatusAgendamento status : values()) {
            if (status.chave.equalsIgnoreCase(valor) || status.name().equalsIgnoreCase(valor)) {
                return status;
            }
        }
        throw new IllegalArgumentException("Status de agendamento desconhecido: " + valor);
    }

    @Converter(autoApply = true)
    public static class Conversor extends ConversorDeChave<StatusAgendamento> {
        public Conversor() {
            super(StatusAgendamento.class);
        }
    }
}
