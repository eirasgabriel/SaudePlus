package br.com.saudeplus.arquivos;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.nio.charset.StandardCharsets;
import java.util.Optional;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

class TipoDeArquivoTest {

    @Test
    @DisplayName("reconhece PDF, PNG e JPEG pelos primeiros bytes")
    void reconhece() {
        assertEquals(Optional.of(TipoDeArquivo.PDF), TipoDeArquivo.detectar("%PDF-1.7\n...".getBytes(StandardCharsets.US_ASCII)));
        assertEquals(Optional.of(TipoDeArquivo.PNG), TipoDeArquivo.detectar(
                new byte[] {(byte) 0x89, 'P', 'N', 'G', 0x0D, 0x0A, 0x1A, 0x0A, 0, 0}));
        assertEquals(Optional.of(TipoDeArquivo.JPEG), TipoDeArquivo.detectar(
                new byte[] {(byte) 0xFF, (byte) 0xD8, (byte) 0xFF, (byte) 0xE0}));
    }

    @Test
    @DisplayName("recusa o que não é um dos formatos, mesmo com nome de PDF")
    void recusa() {
        assertTrue(TipoDeArquivo.detectar("<html>laudo.pdf</html>".getBytes(StandardCharsets.UTF_8)).isEmpty());
        assertTrue(TipoDeArquivo.detectar(new byte[] {'%', 'P'}).isEmpty(), "curto demais");
        assertTrue(TipoDeArquivo.detectar(new byte[0]).isEmpty());
    }

    @Test
    @DisplayName("acha o tipo pela extensão da chave guardada")
    void porExtensao() {
        assertEquals(Optional.of(TipoDeArquivo.JPEG), TipoDeArquivo.porExtensao("0b9c6f3e-5a51-4c8e-9f2d-6f1d2a7c4b10.jpg"));
        assertTrue(TipoDeArquivo.porExtensao("arquivo.exe").isEmpty());
    }
}
