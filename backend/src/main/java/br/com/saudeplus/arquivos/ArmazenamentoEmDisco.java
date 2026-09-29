package br.com.saudeplus.arquivos;

import java.io.IOException;
import java.io.UncheckedIOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.UUID;
import java.util.regex.Pattern;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.PathResource;
import org.springframework.core.io.Resource;
import org.springframework.stereotype.Component;

/**
 * Guarda os arquivos numa pasta local (`saudeplus.arquivos.dir`). Serve para
 * desenvolvimento e para um servidor único; com mais de uma instância, troque
 * por um armazenamento compartilhado.
 */
@Component
class ArmazenamentoEmDisco implements ArmazenamentoArquivos {

    /** Só chaves geradas aqui: `<uuid>.<extensão>`. Impede `../` e caminhos absolutos. */
    private static final Pattern CHAVE_VALIDA = Pattern.compile("[0-9a-f-]{36}\\.(pdf|png|jpg)");

    private final Path pasta;

    ArmazenamentoEmDisco(@Value("${saudeplus.arquivos.dir}") String pasta) {
        this.pasta = Path.of(pasta).toAbsolutePath().normalize();
    }

    @Override
    public String guardar(byte[] conteudo, TipoDeArquivo tipo) {
        String chave = UUID.randomUUID() + "." + tipo.extensao();
        try {
            Files.createDirectories(pasta);
            Files.write(pasta.resolve(chave), conteudo);
        } catch (IOException excecao) {
            throw new UncheckedIOException("Não foi possível gravar o arquivo.", excecao);
        }
        return chave;
    }

    @Override
    public Resource ler(String chave) {
        return new PathResource(caminho(chave));
    }

    @Override
    public void remover(String chave) {
        try {
            Files.deleteIfExists(caminho(chave));
        } catch (IOException excecao) {
            throw new UncheckedIOException("Não foi possível remover o arquivo.", excecao);
        }
    }

    private Path caminho(String chave) {
        if (!CHAVE_VALIDA.matcher(chave).matches()) {
            throw new IllegalArgumentException("Chave de arquivo inválida.");
        }
        return pasta.resolve(chave);
    }
}
