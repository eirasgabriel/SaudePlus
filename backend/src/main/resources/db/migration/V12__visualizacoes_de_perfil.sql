-- "Profissionais em destaque": quantas vezes o perfil público de cada médico
-- foi aberto, por dia. Só contadores agregados: nada de IP, conta ou horário,
-- então não há dado pessoal de quem visitou.
CREATE TABLE visualizacoes_de_perfil (
    medico_id uuid    NOT NULL REFERENCES medicos (id) ON DELETE CASCADE,
    dia       date    NOT NULL,
    total     integer NOT NULL DEFAULT 0 CHECK (total >= 0),
    PRIMARY KEY (medico_id, dia)
);
CREATE INDEX idx_visualizacoes_de_perfil_dia ON visualizacoes_de_perfil (dia);
COMMENT ON TABLE visualizacoes_de_perfil IS 'Contador diário de aberturas do perfil público do médico (sem dado pessoal).';
