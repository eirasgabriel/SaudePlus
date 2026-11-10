-- A matriz inicial (V2) copiava o mock da tela de configurações, feito só para
-- exibição. Desde que a matriz passou a valer no servidor (`AcessoAoAdmin`),
-- ela precisa de um padrão conservador:
--   - MEDICO não entra na área administrativa: tem a própria (/api/medico).
--   - Enfermagem e recepção não gerenciam contas.
--   - Enfermagem não vê o financeiro.
-- A administração pode liberar mais pela tela de permissões.

DELETE FROM permissoes WHERE papel = 'MEDICO';
DELETE FROM permissoes WHERE papel IN ('ENFERMEIRO', 'RECEPCIONISTA') AND modulo = 'usuarios';
DELETE FROM permissoes WHERE papel = 'ENFERMEIRO' AND modulo = 'financeiro';

-- Enfermagem acompanha a agenda e os exames (módulo "agendamentos").
INSERT INTO permissoes (papel, modulo) VALUES ('ENFERMEIRO', 'agendamentos')
ON CONFLICT DO NOTHING;
