package br.com.saudeplus.agenda;

import java.util.UUID;

/** Par médico/modalidade lido das disponibilidades. */
public record ModalidadeDoMedico(UUID medicoId, Modalidade modalidade) {
}
