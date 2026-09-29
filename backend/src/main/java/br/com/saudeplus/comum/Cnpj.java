package br.com.saudeplus.comum;

/**
 * CNPJ: confere os dígitos verificadores e guarda sempre no formato
 * `00.000.000/0000-00`, como o {@link Cpf}.
 */
public final class Cnpj {

    private static final int[] PESOS = {6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2};

    private Cnpj() {
    }

    /** `null`/vazio → `null`; inválido → IllegalArgumentException; válido → formatado. */
    public static String normalizar(String valor) {
        if (valor == null || valor.isBlank()) {
            return null;
        }
        String digitos = valor.replaceAll("\\D", "");
        if (!valido(digitos)) {
            throw new IllegalArgumentException("CNPJ inválido.");
        }
        return "%s.%s.%s/%s-%s".formatted(digitos.substring(0, 2), digitos.substring(2, 5), digitos.substring(5, 8),
                digitos.substring(8, 12), digitos.substring(12));
    }

    static boolean valido(String digitos) {
        if (digitos.length() != 14 || digitos.chars().distinct().count() == 1) {
            return false;
        }
        return digitoVerificador(digitos, 12) == digitos.charAt(12) - '0'
                && digitoVerificador(digitos, 13) == digitos.charAt(13) - '0';
    }

    /** Primeiro dígito usa os pesos 5..2,9..2; o segundo, 6..2,9..2. */
    private static int digitoVerificador(String digitos, int quantidade) {
        int soma = 0;
        int deslocamento = PESOS.length - quantidade;
        for (int i = 0; i < quantidade; i++) {
            soma += (digitos.charAt(i) - '0') * PESOS[deslocamento + i];
        }
        int resto = soma % 11;
        return resto < 2 ? 0 : 11 - resto;
    }
}
