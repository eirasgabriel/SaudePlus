-- Dados de referência que valem em qualquer ambiente (inclusive produção).
-- Dados de demonstração (médicos, pacientes, agendamentos) ficam fora daqui.

INSERT INTO especialidades (slug, nome, descricao) VALUES
    ('clinico-geral',  'Clínico Geral',  'Saúde integral'),
    ('pediatria',      'Pediatria',      'Cuidado para os pequenos'),
    ('ginecologia',    'Ginecologia',    'Saúde da mulher'),
    ('cardiologia',    'Cardiologia',    'Saúde do coração'),
    ('dermatologia',   'Dermatologia',   'Saúde da pele'),
    ('ortopedia',      'Ortopedia',      'Ossos e articulações'),
    ('oftalmologia',   'Oftalmologia',   'Saúde da visão'),
    ('psiquiatria',    'Psiquiatria',    'Saúde mental'),
    ('endocrinologia', 'Endocrinologia', 'Hormônios e metabolismo'),
    ('odontologia',    'Odontologia',    'Saúde bucal'),
    ('pneumologia',    'Pneumologia',    'Saúde respiratória'),
    ('nutricao',       'Nutrição',       'Alimentação saudável');

INSERT INTO convenios (nome) VALUES
    ('Amil'),
    ('Bradesco Saúde'),
    ('SulAmérica'),
    ('Unimed');

INSERT INTO tipos_exame (nome, categoria, preparo, prazo_resultado_dias) VALUES
    ('Hemograma completo',        'Exame de sangue', 'Jejum não obrigatório. Evite exercícios intensos nas 24h anteriores.', 2),
    ('Glicemia de jejum',         'Exame de sangue', 'Jejum de 8 a 12 horas. Água liberada.', 1),
    ('Colesterol total e frações','Exame de sangue', 'Jejum de 12 horas e sem bebida alcoólica nas 72h anteriores.', 2),
    ('TSH e T4 livre',            'Exame de sangue', 'Jejum não obrigatório. Informe medicamentos para tireoide em uso.', 3),
    ('Urina tipo 1',              'Exame de urina',  'Primeira urina da manhã, após higiene íntima.', 1),
    ('Eletrocardiograma',         'Cardiológico',    'Evite cremes no tórax no dia do exame.', 0),
    ('Ecocardiograma',            'Cardiológico',    'Sem preparo específico.', 3),
    ('Raio-X de tórax',           'Imagem',          'Retire objetos metálicos. Informe se houver possibilidade de gravidez.', 2),
    ('Ultrassonografia abdominal','Imagem',          'Jejum de 8 horas.', 3);

-- Matriz inicial de permissões (espelha permissoesIniciais do front-end).
-- ADMIN tem acesso total por regra de código; as linhas dele ficam aqui só
-- para a tela de configurações exibir a matriz completa.
INSERT INTO permissoes (papel, modulo) VALUES
    ('ADMIN', 'dashboard'), ('ADMIN', 'usuarios'), ('ADMIN', 'clinicas'), ('ADMIN', 'agendamentos'),
    ('ADMIN', 'relatorios'), ('ADMIN', 'financeiro'), ('ADMIN', 'configuracoes'),
    ('GESTOR', 'dashboard'), ('GESTOR', 'usuarios'), ('GESTOR', 'clinicas'), ('GESTOR', 'agendamentos'),
    ('GESTOR', 'relatorios'),
    ('MEDICO', 'dashboard'), ('MEDICO', 'usuarios'), ('MEDICO', 'clinicas'), ('MEDICO', 'agendamentos'),
    ('ENFERMEIRO', 'dashboard'), ('ENFERMEIRO', 'usuarios'), ('ENFERMEIRO', 'relatorios'), ('ENFERMEIRO', 'financeiro'),
    ('RECEPCIONISTA', 'dashboard'), ('RECEPCIONISTA', 'usuarios'), ('RECEPCIONISTA', 'agendamentos'),
    ('RECEPCIONISTA', 'relatorios');

INSERT INTO configuracoes (chave, valor) VALUES
    ('gerais', '{"nomeSistema": "SaudePlus", "fusoHorario": "America/Sao_Paulo", "idioma": "pt-BR"}'),
    ('agendamento', '{"antecedenciaMinimaHoras": 2, "antecedenciaCancelamentoHoras": 24, "janelaAgendamentoDias": 60}'),
    ('seguranca', '{"validadeTokenHoras": 8, "tentativasLogin": 5}'),
    ('notificacoes', '{"email": true, "lembreteVesperaConsulta": true}'),
    ('integracoes', '{}');
