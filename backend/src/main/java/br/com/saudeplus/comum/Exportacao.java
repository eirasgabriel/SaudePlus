package br.com.saudeplus.comum;

import java.io.ByteArrayOutputStream;
import java.nio.charset.StandardCharsets;
import java.text.Normalizer;
import java.util.List;
import java.util.Locale;

import org.openpdf.text.Document;
import org.openpdf.text.Element;
import org.openpdf.text.Font;
import org.openpdf.text.FontFactory;
import org.openpdf.text.PageSize;
import org.openpdf.text.Paragraph;
import org.openpdf.text.Phrase;
import org.openpdf.text.pdf.PdfPCell;
import org.openpdf.text.pdf.PdfPTable;
import org.openpdf.text.pdf.PdfWriter;
import org.springframework.http.CacheControl;
import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;

/**
 * Relatórios para baixar: a mesma tabela sai em CSV (aberto direto no Excel
 * em português) ou em PDF.
 */
public final class Exportacao {

    private Exportacao() {
    }

    /** Uma tabela pronta para exportar. Toda célula já vem formatada como texto. */
    public record Tabela(String titulo, String subtitulo, List<String> colunas, List<List<String>> linhas) {
    }

    public enum Formato {
        CSV, PDF;

        /** "csv", "pdf" ou "excel" (vira CSV, que o Excel abre direto). */
        public static Formato porChave(String valor) {
            if (valor == null || valor.isBlank()) {
                return CSV;
            }
            return switch (valor.strip().toLowerCase(Locale.ROOT)) {
                case "csv", "excel", "xlsx" -> CSV;
                case "pdf" -> PDF;
                default -> throw new IllegalArgumentException("Formato desconhecido: " + valor);
            };
        }
    }

    public static ResponseEntity<byte[]> resposta(Tabela tabela, Formato formato) {
        byte[] conteudo = formato == Formato.PDF ? pdf(tabela) : csv(tabela);
        String nome = slug(tabela.titulo()) + (formato == Formato.PDF ? ".pdf" : ".csv");
        return ResponseEntity.ok()
                .contentType(formato == Formato.PDF ? MediaType.APPLICATION_PDF : new MediaType("text", "csv", StandardCharsets.UTF_8))
                .header(HttpHeaders.CONTENT_DISPOSITION, ContentDisposition.attachment().filename(nome).build().toString())
                .cacheControl(CacheControl.noStore())
                .header("X-Content-Type-Options", "nosniff")
                .body(conteudo);
    }

    /**
     * CSV no padrão do Excel brasileiro: `;` como separador e BOM UTF-8 para os
     * acentos. Células que começam com `= + - @` ganham um apóstrofo, para o
     * Excel não executá-las como fórmula (injeção de CSV).
     */
    public static byte[] csv(Tabela tabela) {
        StringBuilder texto = new StringBuilder("﻿");
        texto.append(linhaCsv(tabela.colunas()));
        for (List<String> linha : tabela.linhas()) {
            texto.append(linhaCsv(linha));
        }
        return texto.toString().getBytes(StandardCharsets.UTF_8);
    }

    private static String linhaCsv(List<String> celulas) {
        StringBuilder linha = new StringBuilder();
        for (int i = 0; i < celulas.size(); i++) {
            if (i > 0) {
                linha.append(';');
            }
            linha.append(celulaCsv(celulas.get(i)));
        }
        return linha.append("\r\n").toString();
    }

    static String celulaCsv(String valor) {
        String texto = valor == null ? "" : valor;
        if (!texto.isEmpty() && "=+-@\t\r".indexOf(texto.charAt(0)) >= 0) {
            texto = "'" + texto;
        }
        if (texto.contains(";") || texto.contains("\"") || texto.contains("\n") || texto.contains("\r")) {
            texto = "\"" + texto.replace("\"", "\"\"") + "\"";
        }
        return texto;
    }

    /** PDF em A4 paisagem, com título, subtítulo (filtros) e a tabela. */
    public static byte[] pdf(Tabela tabela) {
        ByteArrayOutputStream saida = new ByteArrayOutputStream();
        Document documento = new Document(PageSize.A4.rotate(), 28, 28, 28, 28);
        PdfWriter.getInstance(documento, saida);
        documento.open();
        documento.add(new Paragraph(tabela.titulo(), FontFactory.getFont(FontFactory.HELVETICA_BOLD, 14)));
        if (tabela.subtitulo() != null) {
            documento.add(new Paragraph(tabela.subtitulo(), FontFactory.getFont(FontFactory.HELVETICA, 9)));
        }
        documento.add(new Paragraph(" "));

        PdfPTable grade = new PdfPTable(tabela.colunas().size());
        grade.setWidthPercentage(100);
        grade.setHeaderRows(1);
        Font cabecalho = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 8);
        Font corpo = FontFactory.getFont(FontFactory.HELVETICA, 8);
        for (String coluna : tabela.colunas()) {
            PdfPCell celula = new PdfPCell(new Phrase(coluna, cabecalho));
            celula.setGrayFill(0.9f);
            grade.addCell(celula);
        }
        for (List<String> linha : tabela.linhas()) {
            for (String valor : linha) {
                grade.addCell(new Phrase(valor == null ? "" : valor, corpo));
            }
        }
        if (tabela.linhas().isEmpty()) {
            PdfPCell vazio = new PdfPCell(new Phrase("Nenhum registro no período.", corpo));
            vazio.setColspan(tabela.colunas().size());
            vazio.setHorizontalAlignment(Element.ALIGN_CENTER);
            grade.addCell(vazio);
        }
        documento.add(grade);
        documento.close();
        return saida.toByteArray();
    }

    private static String slug(String texto) {
        return Normalizer.normalize(texto, Normalizer.Form.NFD).replaceAll("\\p{M}", "").toLowerCase(Locale.ROOT)
                .replaceAll("[^a-z0-9]+", "-").replaceAll("(^-|-$)", "");
    }
}
