-- "Buscas populares": quantas buscas públicas filtraram por cada especialidade,
-- por dia. Só contadores agregados: nada de termo digitado, IP, conta ou
-- horário exato, então não há dado pessoal guardado.
CREATE TABLE buscas_por_especialidade (
    especialidade_id uuid    NOT NULL REFERENCES especialidades (id) ON DELETE CASCADE,
    dia              date    NOT NULL,
    total            integer NOT NULL DEFAULT 0 CHECK (total >= 0),
    PRIMARY KEY (especialidade_id, dia)
);
CREATE INDEX idx_buscas_por_especialidade_dia ON buscas_por_especialidade (dia);
COMMENT ON TABLE buscas_por_especialidade IS 'Contador diário de buscas públicas por especialidade (sem dado pessoal).';
