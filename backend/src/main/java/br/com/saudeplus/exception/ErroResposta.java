package br.com.saudeplus.exception;

import java.time.OffsetDateTime;
import java.util.List;

/**
 * Corpo único de erro da API: toda falha sai neste formato, para o cliente
 * não precisar adivinhar a forma da resposta. `campos` só é preenchido em
 * erro de validação; nos demais casos vai como lista vazia, nunca ausente.
 */
public record ErroResposta(
        OffsetDateTime momento,
        int status,
        String erro,
        String mensagem,
        String caminho,
        List<CampoInvalido> campos) {

    public record CampoInvalido(String campo, String mensagem) {
    }

    public static ErroResposta de(int status, String erro, String mensagem, String caminho) {
        return new ErroResposta(OffsetDateTime.now(), status, erro, mensagem, caminho, List.of());
    }

    public static ErroResposta validacao(String caminho, List<CampoInvalido> campos) {
        return new ErroResposta(
                OffsetDateTime.now(),
                422,
                "Unprocessable Entity",
                "Alguns campos estão inválidos.",
                caminho,
                campos);
    }
}
