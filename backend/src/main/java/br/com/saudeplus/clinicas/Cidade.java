package br.com.saudeplus.clinicas;

/** Cidade atendida. `rotulo` é o texto do filtro no front ("São Paulo - SP"). */
public record Cidade(String nome, String uf) {

    public String rotulo() {
        return nome + " - " + uf;
    }
}
