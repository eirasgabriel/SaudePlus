package br.com.saudeplus.pacientes;

/** Paciente sob acompanhamento de um profissional. */
public record Paciente(
        String id,
        String nome,
        int idade,
        String motivo,
        String medicoId) {

    /**
     * Iniciais para o avatar: primeiro e último nome, ignorando partículas
     * em minúsculo ("Maria da Silva" vira "MS"). Mesma regra do front-end,
     * para o avatar não mudar conforme quem calcula.
     */
    public String iniciais() {
        if (nome == null || nome.isBlank()) {
            return "";
        }
        String[] partes = nome.trim().split("\\s+");
        java.util.List<String> relevantes = new java.util.ArrayList<>();
        for (String parte : partes) {
            if (parte.length() > 2 || Character.isUpperCase(parte.charAt(0))) {
                relevantes.add(parte);
            }
        }
        if (relevantes.isEmpty()) {
            return "";
        }
        char primeira = relevantes.get(0).charAt(0);
        if (relevantes.size() == 1) {
            return String.valueOf(Character.toUpperCase(primeira));
        }
        char ultima = relevantes.get(relevantes.size() - 1).charAt(0);
        return ("" + Character.toUpperCase(primeira) + Character.toUpperCase(ultima));
    }
}
