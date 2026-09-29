package br.com.saudeplus.comum;

import org.springframework.core.io.Resource;
import org.springframework.http.CacheControl;
import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;

import br.com.saudeplus.exames.ExamesService.ArquivoDoResultado;

/** Resposta HTTP de download: anexo, com nome, e sem cache (é dado de saúde). */
public final class Downloads {

    private Downloads() {
    }

    public static ResponseEntity<Resource> anexo(ArquivoDoResultado arquivo) {
        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(arquivo.contentType()))
                .header(HttpHeaders.CONTENT_DISPOSITION,
                        ContentDisposition.attachment().filename(arquivo.nomeDoArquivo()).build().toString())
                .cacheControl(CacheControl.noStore())
                .header("X-Content-Type-Options", "nosniff")
                .body(arquivo.conteudo());
    }
}
