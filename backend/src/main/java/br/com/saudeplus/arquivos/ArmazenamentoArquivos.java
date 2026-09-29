package br.com.saudeplus.arquivos;

import org.springframework.core.io.Resource;

/**
 * Onde ficam os arquivos enviados (resultados de exame). As regras de negócio
 * só conhecem esta interface: trocar o disco por um bucket (S3, GCS) é trocar
 * a implementação.
 */
public interface ArmazenamentoArquivos {

    /**
     * Guarda o conteúdo e devolve a chave para buscá-lo depois. A chave é
     * gerada aqui (nunca vem do nome enviado pelo usuário).
     */
    String guardar(byte[] conteudo, TipoDeArquivo tipo);

    Resource ler(String chave);

    /** Remove, se existir. Usado ao substituir um resultado. */
    void remover(String chave);
}
