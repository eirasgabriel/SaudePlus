package br.com.saudeplus.painel.dto;

/**
 * Os quatro números do topo do painel.
 *
 * `primeiroHorarioPendente` vem nulo quando não há mais consultas a fazer —
 * o front-end troca o texto de apoio nesse caso.
 */
public record ResumoDoDiaResposta(
        int consultasHoje,
        int pacientesAtendidos,
        int examesPendentes,
        int proximasConsultas,
        String primeiroHorarioPendente) {
}
