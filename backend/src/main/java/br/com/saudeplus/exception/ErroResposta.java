package br.com.saudeplus.exception;

import java.time.Instant;
import java.util.Map;

import com.fasterxml.jackson.annotation.JsonInclude;

/**
 * Corpo único de erro da API (contrato em `docs/api.md`): toda falha sai
 * neste formato, para o cliente não precisar adivinhar a forma da resposta.
 *
 * `campos` mapeia nome do campo para mensagem e só aparece em erro de
 * validação — é o que os formulários usam para destacar o input.
 */
public record ErroResposta(
        Instant timestamp,
        int status,
        String erro,
        String mensagem,
        String caminho,
        @JsonInclude(JsonInclude.Include.NON_EMPTY) Map<String, String> campos) {

    public static ErroResposta de(int status, String erro, String mensagem, String caminho) {
        return new ErroResposta(Instant.now(), status, erro, mensagem, caminho, Map.of());
    }

    public static ErroResposta validacao(String caminho, Map<String, String> campos) {
        return new ErroResposta(
                Instant.now(),
                400,
                "Dados inválidos",
                "Confira os campos destacados e tente novamente.",
                caminho,
                campos);
    }
}
