package br.com.saudeplus.financeiro;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertThrows;

import java.math.BigDecimal;
import java.time.Instant;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import br.com.saudeplus.exception.RegraDeNegocioException;
import br.com.saudeplus.exception.RequisicaoInvalidaException;

class TransacaoTest {

    private static final Instant AGORA = Instant.parse("2026-09-28T12:00:00Z");

    private static Transacao pendente() {
        return new Transacao(null, null, "Consulta", new BigDecimal("150.00"), null, AGORA);
    }

    @Test
    @DisplayName("pagar exige a forma e registra a data do pagamento")
    void pagar() {
        Transacao t = pendente();
        assertThrows(RequisicaoInvalidaException.class, () -> t.pagar(null, AGORA));
        Transacao outra = pendente();
        outra.pagar(FormaPagamento.PIX, AGORA.plusSeconds(60));
        assertEquals(StatusTransacao.PAGO, outra.getStatus());
        assertEquals(FormaPagamento.PIX, outra.getForma());
        assertEquals(AGORA.plusSeconds(60), outra.getPagoEm());
    }

    @Test
    @DisplayName("convênio já definido dispensa informar a forma na baixa")
    void convenio() {
        Transacao t = new Transacao(null, null, "Consulta", BigDecimal.TEN, FormaPagamento.CONVENIO, AGORA);
        t.pagar(null, AGORA);
        assertEquals(FormaPagamento.CONVENIO, t.getForma());
    }

    @Test
    @DisplayName("pendente anulada fica estornada sem data de pagamento; estornado é final")
    void estornar() {
        Transacao t = pendente();
        t.estornar(AGORA);
        assertEquals(StatusTransacao.ESTORNADO, t.getStatus());
        assertNull(t.getPagoEm());
        assertThrows(RegraDeNegocioException.class, () -> t.pagar(FormaPagamento.PIX, AGORA));
        assertThrows(RegraDeNegocioException.class, () -> t.estornar(AGORA));
    }

    @Test
    @DisplayName("valor negativo é recusado")
    void valorNegativo() {
        assertThrows(RequisicaoInvalidaException.class,
                () -> new Transacao(null, null, "x", new BigDecimal("-1"), null, AGORA));
    }
}
