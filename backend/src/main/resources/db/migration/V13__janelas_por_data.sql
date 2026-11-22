-- Janelas de atendimento por data: o médico passa a abrir a agenda em dias
-- específicos (dd/mm/aa), não mais "toda segunda". As janelas semanais que já
-- existem continuam valendo; cada janela tem exatamente um dos dois.
ALTER TABLE disponibilidades ALTER COLUMN dia_semana DROP NOT NULL;
ALTER TABLE disponibilidades ADD COLUMN data date;
ALTER TABLE disponibilidades ADD CONSTRAINT ck_disponibilidades_dia_ou_data
    CHECK ((dia_semana IS NULL) <> (data IS NULL));
CREATE INDEX ix_disponibilidades_medico_data ON disponibilidades (medico_id, data) WHERE data IS NOT NULL;
COMMENT ON COLUMN disponibilidades.data IS 'Dia da janela (janela avulsa). Nulo nas janelas semanais antigas (dia_semana).';
COMMENT ON COLUMN disponibilidades.dia_semana IS 'ISO 1 = segunda. Só nas janelas semanais antigas; as novas usam data.';
