package br.com.saudeplus.arquivos;

import java.util.Arrays;
import java.util.Optional;

/**
 * Formatos aceitos para resultado de exame. O tipo é descoberto pelos
 * primeiros bytes do arquivo (assinatura), não pela extensão nem pelo
 * `Content-Type` que o navegador informa — os dois são fáceis de falsificar.
 */
public enum TipoDeArquivo {
    PDF("application/pdf", "pdf", new byte[] {'%', 'P', 'D', 'F', '-'}),
    PNG("image/png", "png", new byte[] {(byte) 0x89, 'P', 'N', 'G', 0x0D, 0x0A, 0x1A, 0x0A}),
    JPEG("image/jpeg", "jpg", new byte[] {(byte) 0xFF, (byte) 0xD8, (byte) 0xFF});

    private final String contentType;
    private final String extensao;
    private final byte[] assinatura;

    TipoDeArquivo(String contentType, String extensao, byte[] assinatura) {
        this.contentType = contentType;
        this.extensao = extensao;
        this.assinatura = assinatura;
    }

    /** O formato cujos bytes iniciais batem com a assinatura, se algum bater. */
    public static Optional<TipoDeArquivo> detectar(byte[] conteudo) {
        return Arrays.stream(values())
                .filter(tipo -> conteudo.length >= tipo.assinatura.length
                        && Arrays.equals(conteudo, 0, tipo.assinatura.length, tipo.assinatura, 0, tipo.assinatura.length))
                .findFirst();
    }

    /** Pelo nome guardado (`<uuid>.pdf`), para servir o arquivo de volta. */
    public static Optional<TipoDeArquivo> porExtensao(String nome) {
        return Arrays.stream(values()).filter(tipo -> nome.endsWith("." + tipo.extensao)).findFirst();
    }

    public String contentType() {
        return contentType;
    }

    public String extensao() {
        return extensao;
    }
}
