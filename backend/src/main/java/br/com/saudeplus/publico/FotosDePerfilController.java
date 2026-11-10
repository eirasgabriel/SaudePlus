package br.com.saudeplus.publico;

import java.time.Duration;
import java.util.regex.Pattern;

import org.springframework.core.io.Resource;
import org.springframework.http.CacheControl;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import br.com.saudeplus.arquivos.ArmazenamentoArquivos;
import br.com.saudeplus.arquivos.TipoDeArquivo;
import br.com.saudeplus.exception.RecursoNaoEncontradoException;
import br.com.saudeplus.usuarios.UsuarioRepository;

/**
 * Fotos de perfil enviadas pelos usuários (`POST /api/auth/perfil/foto`).
 * Públicas como a foto do perfil profissional. A pasta de arquivos também
 * guarda resultados de exame, então só sai daqui uma chave que está gravada
 * como foto de algum usuário.
 */
@RestController
@RequestMapping("/api/publico/fotos")
public class FotosDePerfilController {

    private static final Pattern CHAVE = Pattern.compile("[0-9a-f-]{36}\\.(png|jpg|webp)");

    private final UsuarioRepository usuarios;
    private final ArmazenamentoArquivos armazenamento;

    public FotosDePerfilController(UsuarioRepository usuarios, ArmazenamentoArquivos armazenamento) {
        this.usuarios = usuarios;
        this.armazenamento = armazenamento;
    }

    @GetMapping("/{chave}")
    @Transactional(readOnly = true)
    public ResponseEntity<Resource> foto(@PathVariable String chave) {
        if (!CHAVE.matcher(chave).matches() || !usuarios.existsByFotoChave(chave)) {
            throw new RecursoNaoEncontradoException("Foto não encontrada.");
        }
        Resource arquivo = armazenamento.ler(chave);
        if (!arquivo.exists()) {
            throw new RecursoNaoEncontradoException("Foto não encontrada.");
        }
        // A chave muda a cada envio, então o conteúdo de uma chave nunca muda.
        MediaType tipo = TipoDeArquivo.porExtensao(chave)
                .map(t -> MediaType.parseMediaType(t.contentType()))
                .orElse(MediaType.APPLICATION_OCTET_STREAM);
        return ResponseEntity.ok()
                .contentType(tipo)
                .cacheControl(CacheControl.maxAge(Duration.ofDays(30)).cachePublic().immutable())
                .header("X-Content-Type-Options", "nosniff")
                .body(arquivo);
    }
}
