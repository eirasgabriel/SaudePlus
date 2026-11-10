package br.com.saudeplus.comum;

/**
 * Enum que trafega (no JSON e no banco) por uma chave minúscula estável, como
 * `em_andamento`, em vez do nome da constante Java.
 */
public interface EnumComChave {

    String chave();
}
