package br.com.saudeplus.areamedico.dto;

import java.time.LocalDate;
import java.util.UUID;

/**
 * Paciente na lista do médico.
 *
 * @param idade nula quando o paciente não informou a data de nascimento
 * @param motivo descrição da consulta mais recente com este médico
 */
public record PacienteResumoResposta(UUID id, String nome, Integer idade, String motivo, String iniciais,
        LocalDate ultimaConsulta) {
}
