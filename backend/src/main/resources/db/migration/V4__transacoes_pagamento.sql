-- Cobrança nasce pendente quando a consulta é confirmada, antes de se saber
-- como será paga: a forma passa a ser opcional até o pagamento.
ALTER TABLE transacoes ALTER COLUMN forma DROP NOT NULL;

-- `data_hora` é quando a cobrança foi lançada; a receita conta pela data do
-- pagamento, e o estorno pela data do estorno.
ALTER TABLE transacoes ADD COLUMN pago_em timestamptz;
ALTER TABLE transacoes ADD COLUMN estornado_em timestamptz;

CREATE INDEX ix_transacoes_agendamento ON transacoes (agendamento_id);
CREATE INDEX ix_transacoes_pago_em ON transacoes (pago_em);
