-- ---------------------------------------------------------------------------
-- 1. Consultas sobrepostas: o banco passa a recusar
-- ---------------------------------------------------------------------------
-- O índice único uk_agendamentos_horario_ativo só barra dois agendamentos com
-- o MESMO início. Uma consulta às 08:00 de 30 min e outra às 08:20 dependiam
-- só da aplicação. As restrições de exclusão abaixo recusam qualquer
-- sobreposição de consultas ativas, do mesmo médico ou do mesmo paciente,
-- mesmo com duas requisições simultâneas.
--
-- Se esta migração falhar com "could not create exclusion constraint", já há
-- sobreposições gravadas. Para achá-las (troque medico_id por paciente_id
-- para as do paciente):
--   SELECT a.id, b.id FROM agendamentos a JOIN agendamentos b
--     ON a.medico_id = b.medico_id AND a.id < b.id
--    AND tsrange(a.data + a.horario, a.data + a.horario + make_interval(mins => a.duracao_min))
--     && tsrange(b.data + b.horario, b.data + b.horario + make_interval(mins => b.duracao_min))
--    WHERE a.status NOT IN ('cancelada', 'faltou') AND b.status NOT IN ('cancelada', 'faltou');

-- btree_gist permite misturar igualdade (medico_id) e intervalo (periodo) no
-- mesmo índice GiST. Vem com o PostgreSQL; em banco gerenciado, confira se
-- a extensão é permitida.
CREATE EXTENSION IF NOT EXISTS btree_gist;

-- Intervalo da consulta em horário local da unidade, calculado pelo banco:
-- ninguém grava nesta coluna, e ela nunca fica fora de sincronia.
ALTER TABLE agendamentos ADD COLUMN periodo tsrange GENERATED ALWAYS AS (
    tsrange(data + horario, data + horario + make_interval(mins => duracao_min::int))
) STORED;

ALTER TABLE agendamentos ADD CONSTRAINT ex_agendamentos_medico_sem_sobreposicao
    EXCLUDE USING gist (medico_id WITH =, periodo WITH &&)
    WHERE (status NOT IN ('cancelada', 'faltou'));

ALTER TABLE agendamentos ADD CONSTRAINT ex_agendamentos_paciente_sem_sobreposicao
    EXCLUDE USING gist (paciente_id WITH =, periodo WITH &&)
    WHERE (status NOT IN ('cancelada', 'faltou'));

-- ---------------------------------------------------------------------------
-- 2. Índices dos filtros da administração
-- ---------------------------------------------------------------------------
-- Lista de agendamentos e relatórios filtram por unidade e especialidade num
-- período; a fila de exames da clínica, por status e prazo.
CREATE INDEX ix_agendamentos_unidade_data ON agendamentos (unidade_id, data);
CREATE INDEX ix_agendamentos_especialidade_data ON agendamentos (especialidade_id, data);
CREATE INDEX ix_exames_status_prazo ON exames (status, prazo);

-- ---------------------------------------------------------------------------
-- 3. Uma cobrança automática ativa por consulta
-- ---------------------------------------------------------------------------
-- A cobrança que nasce da confirmação da consulta é "consulta"; o lançamento
-- da administração (taxa, exame particular), mesmo ligado a uma consulta, é
-- "manual" e continua livre. Só a automática precisa ser única.
ALTER TABLE transacoes ADD COLUMN origem varchar(20) NOT NULL DEFAULT 'manual'
    CHECK (origem IN ('consulta', 'manual'));

-- Registros anteriores não diziam a origem. Em cada consulta, a cobrança mais
-- antiga ainda ativa é a automática (ela nasce na confirmação); as demais
-- ficam como manuais. Assim o índice abaixo nunca encontra duplicata.
UPDATE transacoes t SET origem = 'consulta'
 WHERE t.id IN (
    SELECT DISTINCT ON (agendamento_id) id
      FROM transacoes
     WHERE agendamento_id IS NOT NULL AND status <> 'estornado'
     ORDER BY agendamento_id, data_hora, id);

CREATE UNIQUE INDEX uk_transacoes_cobranca_da_consulta ON transacoes (agendamento_id)
    WHERE origem = 'consulta' AND status <> 'estornado';

-- ---------------------------------------------------------------------------
-- 4. LGPD: dados de saúde marcados no próprio schema
-- ---------------------------------------------------------------------------
-- Dado de saúde é dado pessoal sensível (LGPD, art. 5º, II, e art. 11). O
-- comentário aparece em qualquer ferramenta de banco, para quem consultar,
-- exportar ou fizer backup saber o que tem nas mãos. Prontuário não é apagado
-- por rotina: a Resolução CFM 1.821/2007 manda guardá-lo por 20 anos.
COMMENT ON COLUMN agendamentos.motivo IS 'Dado de saúde (LGPD art. 11): motivo informado pelo paciente.';
COMMENT ON COLUMN agendamentos.resumo IS 'Dado de saúde (LGPD art. 11): prontuário, guardar 20 anos (CFM 1.821/2007).';
COMMENT ON COLUMN agendamentos.desfecho IS 'Dado de saúde (LGPD art. 11): prontuário, guardar 20 anos (CFM 1.821/2007).';
COMMENT ON TABLE exames IS 'Dado de saúde (LGPD art. 11): pedidos e resultados de exames; o arquivo fica em saudeplus.arquivos.dir.';
COMMENT ON COLUMN exames.resultado_path IS 'Chave do arquivo do resultado (dado de saúde); leitura registrada em registros_atividade.';
COMMENT ON COLUMN pacientes.data_nascimento IS 'Dado pessoal (LGPD).';
COMMENT ON COLUMN usuarios.cpf IS 'Dado pessoal (LGPD).';
COMMENT ON TABLE registros_atividade IS 'Auditoria, inclusive de leitura de dados de saúde. Retenção em saudeplus.retencao.auditoria.';
