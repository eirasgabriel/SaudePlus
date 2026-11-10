package br.com.saudeplus.comum;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.nio.charset.StandardCharsets;
import java.util.List;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import br.com.saudeplus.comum.Exportacao.Tabela;

class ExportacaoTest {

    private static final Tabela TABELA = new Tabela("Relatório de teste", "Período de teste", List.of("Nome", "Obs"),
            List.of(List.of("Ana; Maria", "disse \"oi\""), List.of("=HYPERLINK(\"x\")", "+1")));

    @Test
    @DisplayName("CSV no padrão do Excel brasileiro: BOM, ponto e vírgula e aspas escapadas")
    void csv() {
        String texto = new String(Exportacao.csv(TABELA), StandardCharsets.UTF_8);
        assertTrue(texto.startsWith("﻿Nome;Obs\r\n"));
        assertTrue(texto.contains("\"Ana; Maria\";\"disse \"\"oi\"\"\"\r\n"));
    }

    @Test
    @DisplayName("célula que começa com = + - @ vira texto (injeção de fórmula)")
    void semFormula() {
        assertEquals("'=1+1", Exportacao.celulaCsv("=1+1"));
        assertEquals("'+55 22 9999", Exportacao.celulaCsv("+55 22 9999"));
        assertEquals("'@SOMA", Exportacao.celulaCsv("@SOMA"));
        assertEquals("R$ 10,00", Exportacao.celulaCsv("R$ 10,00"));
        assertEquals("", Exportacao.celulaCsv(null));
    }

    @Test
    @DisplayName("PDF gerado é um PDF de verdade, inclusive sem linhas")
    void pdf() {
        byte[] conteudo = Exportacao.pdf(TABELA);
        assertTrue(new String(conteudo, 0, 5, StandardCharsets.US_ASCII).equals("%PDF-"));
        byte[] vazio = Exportacao.pdf(new Tabela("Vazio", null, List.of("A"), List.of()));
        assertTrue(vazio.length > 100);
    }

    @Test
    @DisplayName("\"excel\" sai como CSV; formato desconhecido é erro")
    void formatos() {
        assertEquals(Exportacao.Formato.CSV, Exportacao.Formato.porChave("excel"));
        assertEquals(Exportacao.Formato.PDF, Exportacao.Formato.porChave("PDF"));
        assertEquals(Exportacao.Formato.CSV, Exportacao.Formato.porChave(null));
        org.junit.jupiter.api.Assertions.assertThrows(IllegalArgumentException.class,
                () -> Exportacao.Formato.porChave("docx"));
    }
}
