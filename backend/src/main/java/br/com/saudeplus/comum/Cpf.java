package br.com.saudeplus.comum;

/**
 * CPF: confere os dígitos verificadores e guarda sempre no formato
 * `000.000.000-00`, para a busca e o índice único não dependerem de como foi
 * digitado.
 */
public final class Cpf {

    private Cpf() {
    }

    /** `null`/vazio → `null`; inválido → IllegalArgumentException; válido → formatado. */
    public static String normalizar(String valor) {
        if (valor == null || valor.isBlank()) {
            return null;
        }
        String digitos = valor.replaceAll("\\D", "");
        if (!valido(digitos)) {
            throw new IllegalArgumentException("CPF inválido.");
        }
        return "%s.%s.%s-%s".formatted(digitos.substring(0, 3), digitos.substring(3, 6), digitos.substring(6, 9),
                digitos.substring(9));
    }

    static boolean valido(String digitos) {
        if (digitos.length() != 11 || digitos.chars().distinct().count() == 1) {
            return false;
        }
        return digitoVerificador(digitos, 9) == digitos.charAt(9) - '0'
                && digitoVerificador(digitos, 10) == digitos.charAt(10) - '0';
    }

    private static int digitoVerificador(String digitos, int quantidade) {
        int soma = 0;
        for (int i = 0; i < quantidade; i++) {
            soma += (digitos.charAt(i) - '0') * (quantidade + 1 - i);
        }
        int resto = soma % 11;
        return resto < 2 ? 0 : 11 - resto;
    }
}
