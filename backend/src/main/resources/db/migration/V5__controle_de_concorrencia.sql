-- Travamento otimista: cada alteração de uma consulta ou cobrança sobe a
-- versão, e uma alteração feita a partir de uma versão velha falha (409 na
-- API). Evita que duas pessoas mudando a mesma consulta ao mesmo tempo (o
-- paciente cancela enquanto a clínica confirma) sobrescrevam uma à outra.
-- Só acrescenta colunas com valor padrão: nenhum dado existente muda.
ALTER TABLE agendamentos ADD COLUMN versao bigint NOT NULL DEFAULT 0;
ALTER TABLE transacoes ADD COLUMN versao bigint NOT NULL DEFAULT 0;
