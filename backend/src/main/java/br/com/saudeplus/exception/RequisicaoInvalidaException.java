package br.com.saudeplus.exception;

/**
 * Entrada recusada por uma regra que a validação de bean não alcança. Devolve
 * 400 com um título próprio em `erro` (ex.: "Link inválido") e, quando
 * informado, o campo culpado em `campos` para o formulário destacar.
 */
public class RequisicaoInvalidaException extends RuntimeException {

    private final String titulo;
    private final String campo;

    public RequisicaoInvalidaException(String titulo, String mensagem) {
        this(titulo, mensagem, null);
    }

    private RequisicaoInvalidaException(String titulo, String mensagem, String campo) {
        super(mensagem);
        this.titulo = titulo;
        this.campo = campo;
    }

    /** Erro atribuído a um campo do formulário, no mesmo formato da validação. */
    public static RequisicaoInvalidaException noCampo(String campo, String mensagem) {
        return new RequisicaoInvalidaException("Dados inválidos", mensagem, campo);
    }

    public String getTitulo() {
        return titulo;
    }

    public String getCampo() {
        return campo;
    }
}
