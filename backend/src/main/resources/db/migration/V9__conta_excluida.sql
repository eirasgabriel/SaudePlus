-- Conta excluída pela administração: some do sistema e não volta, mas a linha
-- fica guardada com o histórico (LGPD art. 16, I; prontuário por 20 anos, CFM
-- 1.821/2007). Só se chega a 'excluido' a partir de 'inativo'.
ALTER TABLE usuarios DROP CONSTRAINT usuarios_status_check;
ALTER TABLE usuarios ADD CONSTRAINT usuarios_status_check
    CHECK (status IN ('ativo', 'bloqueado', 'inativo', 'excluido'));
COMMENT ON COLUMN usuarios.status IS 'excluido = conta excluída pela administração; dados guardados (LGPD art. 16, I).';

-- A conta excluída guarda e-mail e CPF intactos, mas não os ocupa: a mesma
-- pessoa pode se cadastrar de novo. A unicidade passa a valer só entre as
-- contas que não foram excluídas.
DROP INDEX uk_usuarios_email;
CREATE UNIQUE INDEX uk_usuarios_email ON usuarios (lower(email)) WHERE status <> 'excluido';
DROP INDEX uk_usuarios_cpf;
CREATE UNIQUE INDEX uk_usuarios_cpf ON usuarios (cpf) WHERE cpf IS NOT NULL AND status <> 'excluido';

-- Mesmo para o CRM: o perfil do médico excluído fica (consultas e avaliações
-- apontam para ele), mas o CRM fica livre para um novo cadastro.
ALTER TABLE medicos ADD COLUMN excluido boolean NOT NULL DEFAULT false;
ALTER TABLE medicos DROP CONSTRAINT medicos_crm_crm_uf_key;
CREATE UNIQUE INDEX uk_medicos_crm ON medicos (crm, crm_uf) WHERE NOT excluido;
