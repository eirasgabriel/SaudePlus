-- Dados de demonstração: só carregam nos perfis dev e test
-- (spring.flyway.locations inclui classpath:db/demo). Nunca em produção.
--
-- Migração repetível: o Flyway roda de novo sempre que este arquivo muda.
-- Por isso os ids são fixos e todo INSERT usa ON CONFLICT DO NOTHING.
--
-- Todas as contas de médico daqui entram com a senha Demo@SaudePlus2026.
-- As fotos apontam para frontend/public/images/profissionais/.

-- ---------------------------------------------------------------------------
-- Unidades
-- ---------------------------------------------------------------------------
INSERT INTO unidades (id, nome, endereco, bairro, cidade, uf, telefone, horario_funcionamento, map_url, status) VALUES
    ('a1000000-0000-4000-8000-000000000001', 'Clínica da Família – Centro', 'Rua das Flores, 123', 'Centro', 'Saquarema', 'RJ',
     '(22) 2655-1234', 'Segunda a sexta, 07h às 17h', 'https://maps.google.com/?q=Rua+das+Flores+123+Saquarema', 'ativa'),
    ('a1000000-0000-4000-8000-000000000002', 'UBS Jaconé', 'Av. Beira Mar, 456', 'Jaconé', 'Saquarema', 'RJ',
     '(22) 99876-5432', 'Segunda a sexta, 07h às 17h; sábado, 07h às 12h', NULL, 'ativa'),
    ('a1000000-0000-4000-8000-000000000003', 'SaudePlus Paulista', 'Av. Paulista, 1000', 'Bela Vista', 'São Paulo', 'SP',
     '(11) 3000-1000', 'Segunda a sábado, 07h às 20h', NULL, 'ativa'),
    ('a1000000-0000-4000-8000-000000000004', 'SaudePlus Jardins', 'R. Oscar Freire, 1200', 'Jardim Paulista', 'São Paulo', 'SP',
     '(11) 3000-1200', 'Segunda a sexta, 08h às 19h', NULL, 'ativa'),
    ('a1000000-0000-4000-8000-000000000005', 'SaudePlus Faria Lima', 'Av. Brigadeiro Faria Lima, 2200', 'Itaim Bibi', 'São Paulo', 'SP',
     '(11) 3000-2200', 'Segunda a sexta, 07h às 19h', NULL, 'ativa'),
    ('a1000000-0000-4000-8000-000000000006', 'SaudePlus Haddock Lobo', 'R. Haddock Lobo, 650', 'Cerqueira César', 'São Paulo', 'SP',
     '(11) 3000-0650', 'Segunda a sexta, 08h às 18h', NULL, 'ativa'),
    ('a1000000-0000-4000-8000-000000000007', 'SaudePlus Botafogo', 'R. Voluntários da Pátria, 300', 'Botafogo', 'Rio de Janeiro', 'RJ',
     '(21) 3000-0300', 'Segunda a sexta, 07h às 19h', NULL, 'ativa'),
    ('a1000000-0000-4000-8000-000000000008', 'SaudePlus Savassi', 'R. Pernambuco, 1000', 'Savassi', 'Belo Horizonte', 'MG',
     '(31) 3000-1000', 'Segunda a sexta, 07h às 18h', NULL, 'ativa'),
    ('a1000000-0000-4000-8000-000000000009', 'SaudePlus Batel', 'Av. do Batel, 1500', 'Batel', 'Curitiba', 'PR',
     '(41) 3000-1500', 'Segunda a sexta, 08h às 18h', NULL, 'ativa'),
    -- Fora do ar: não aparece na busca nem nas cidades atendidas.
    ('a1000000-0000-4000-8000-000000000010', 'UBS Itaúna', 'R. do Canal, 80', 'Itaúna', 'Saquarema', 'RJ',
     '(22) 2655-0080', 'Em reforma', NULL, 'manutencao')
ON CONFLICT (id) DO NOTHING;

-- ---------------------------------------------------------------------------
-- Médicos de demonstração (conta + perfil profissional)
-- ---------------------------------------------------------------------------
INSERT INTO usuarios (id, nome_completo, email, senha_hash, telefone, papel, status, foto_url) VALUES
    ('b1000000-0000-4000-8000-000000000001', 'Dr. Roberto Almeida', 'roberto.almeida@demo.saudeplus.com',
     '$2a$10$yqScN9hOcrde4mjK3Zzb4ekjRtQ9FqvqWjYJ4r9IhIrYhuRJH5WeG', NULL, 'MEDICO', 'ativo', '/images/profissionais/dr-roberto-almeida.jpg'),
    ('b1000000-0000-4000-8000-000000000002', 'Dra. Juliana Castro', 'juliana.castro@demo.saudeplus.com',
     '$2a$10$yqScN9hOcrde4mjK3Zzb4ekjRtQ9FqvqWjYJ4r9IhIrYhuRJH5WeG', NULL, 'MEDICO', 'ativo', '/images/profissionais/dr-juliana-castro.jpg'),
    ('b1000000-0000-4000-8000-000000000003', 'Dr. Marcelo Santos', 'marcelo.santos@demo.saudeplus.com',
     '$2a$10$yqScN9hOcrde4mjK3Zzb4ekjRtQ9FqvqWjYJ4r9IhIrYhuRJH5WeG', NULL, 'MEDICO', 'ativo', '/images/profissionais/dr-marcelo-santos.jpg'),
    ('b1000000-0000-4000-8000-000000000004', 'Dra. Fernanda Lima', 'fernanda.lima@demo.saudeplus.com',
     '$2a$10$yqScN9hOcrde4mjK3Zzb4ekjRtQ9FqvqWjYJ4r9IhIrYhuRJH5WeG', NULL, 'MEDICO', 'ativo', '/images/profissionais/dr-fernanda-lima.jpg'),
    ('b1000000-0000-4000-8000-000000000005', 'Dra. Beatriz Nogueira', 'beatriz.nogueira@demo.saudeplus.com',
     '$2a$10$yqScN9hOcrde4mjK3Zzb4ekjRtQ9FqvqWjYJ4r9IhIrYhuRJH5WeG', NULL, 'MEDICO', 'ativo', NULL),
    ('b1000000-0000-4000-8000-000000000006', 'Dr. Paulo Ribeiro', 'paulo.ribeiro@demo.saudeplus.com',
     '$2a$10$yqScN9hOcrde4mjK3Zzb4ekjRtQ9FqvqWjYJ4r9IhIrYhuRJH5WeG', NULL, 'MEDICO', 'ativo', NULL),
    ('b1000000-0000-4000-8000-000000000007', 'Dra. Camila Duarte', 'camila.duarte@demo.saudeplus.com',
     '$2a$10$yqScN9hOcrde4mjK3Zzb4ekjRtQ9FqvqWjYJ4r9IhIrYhuRJH5WeG', NULL, 'MEDICO', 'ativo', NULL)
ON CONFLICT (id) DO NOTHING;

INSERT INTO medicos (id, usuario_id, crm, crm_uf, bio, valor_consulta, nota_media, total_avaliacoes) VALUES
    ('c1000000-0000-4000-8000-000000000001', 'b1000000-0000-4000-8000-000000000001', '123.456', 'SP',
     'Cardiologista com foco em prevenção e reabilitação cardíaca.', 250.00, 4.90, 328),
    ('c1000000-0000-4000-8000-000000000002', 'b1000000-0000-4000-8000-000000000002', '234.567', 'SP',
     'Pediatra, acompanha o desenvolvimento do recém-nascido à adolescência.', 220.00, 4.80, 275),
    ('c1000000-0000-4000-8000-000000000003', 'b1000000-0000-4000-8000-000000000003', '345.678', 'SP',
     'Dermatologia clínica e estética.', 280.00, 4.90, 412),
    ('c1000000-0000-4000-8000-000000000004', 'b1000000-0000-4000-8000-000000000004', '456.789', 'SP',
     'Ginecologia e obstetrícia, com atenção à saúde da mulher em todas as fases.', 260.00, 4.80, 301),
    ('c1000000-0000-4000-8000-000000000005', 'b1000000-0000-4000-8000-000000000005', '567.890', 'RJ',
     'Ortopedista especializada em joelho e medicina esportiva.', 230.00, 4.70, 158),
    ('c1000000-0000-4000-8000-000000000006', 'b1000000-0000-4000-8000-000000000006', '678.901', 'MG',
     'Clínico geral com atendimento também em domicílio.', 180.00, 4.60, 97),
    ('c1000000-0000-4000-8000-000000000007', 'b1000000-0000-4000-8000-000000000007', '789.012', 'PR',
     'Psiquiatra, atendimento exclusivamente on-line.', 300.00, 4.90, 204)
ON CONFLICT (id) DO NOTHING;

INSERT INTO medico_especialidades (medico_id, especialidade_id)
SELECT m.id::uuid, e.id
FROM (VALUES
    ('c1000000-0000-4000-8000-000000000001', 'cardiologia'),
    ('c1000000-0000-4000-8000-000000000002', 'pediatria'),
    ('c1000000-0000-4000-8000-000000000003', 'dermatologia'),
    ('c1000000-0000-4000-8000-000000000004', 'ginecologia'),
    ('c1000000-0000-4000-8000-000000000005', 'ortopedia'),
    ('c1000000-0000-4000-8000-000000000006', 'clinico-geral'),
    ('c1000000-0000-4000-8000-000000000007', 'psiquiatria')
) AS m (id, slug)
JOIN especialidades e ON e.slug = m.slug
ON CONFLICT DO NOTHING;

INSERT INTO medico_convenios (medico_id, convenio_id)
SELECT m.id::uuid, c.id
FROM (VALUES
    ('c1000000-0000-4000-8000-000000000001', 'Amil'),
    ('c1000000-0000-4000-8000-000000000001', 'Bradesco Saúde'),
    ('c1000000-0000-4000-8000-000000000001', 'Unimed'),
    ('c1000000-0000-4000-8000-000000000002', 'SulAmérica'),
    ('c1000000-0000-4000-8000-000000000002', 'Unimed'),
    ('c1000000-0000-4000-8000-000000000003', 'Amil'),
    ('c1000000-0000-4000-8000-000000000003', 'SulAmérica'),
    ('c1000000-0000-4000-8000-000000000004', 'Bradesco Saúde'),
    ('c1000000-0000-4000-8000-000000000004', 'Unimed'),
    ('c1000000-0000-4000-8000-000000000005', 'Amil'),
    ('c1000000-0000-4000-8000-000000000005', 'Unimed'),
    ('c1000000-0000-4000-8000-000000000006', 'Unimed'),
    ('c1000000-0000-4000-8000-000000000007', 'Bradesco Saúde'),
    ('c1000000-0000-4000-8000-000000000007', 'SulAmérica')
) AS m (id, nome)
JOIN convenios c ON c.nome = m.nome
ON CONFLICT DO NOTHING;

INSERT INTO medico_unidades (medico_id, unidade_id) VALUES
    ('c1000000-0000-4000-8000-000000000001', 'a1000000-0000-4000-8000-000000000003'),
    ('c1000000-0000-4000-8000-000000000002', 'a1000000-0000-4000-8000-000000000006'),
    ('c1000000-0000-4000-8000-000000000003', 'a1000000-0000-4000-8000-000000000005'),
    ('c1000000-0000-4000-8000-000000000004', 'a1000000-0000-4000-8000-000000000004'),
    ('c1000000-0000-4000-8000-000000000005', 'a1000000-0000-4000-8000-000000000007'),
    ('c1000000-0000-4000-8000-000000000006', 'a1000000-0000-4000-8000-000000000008'),
    ('c1000000-0000-4000-8000-000000000007', 'a1000000-0000-4000-8000-000000000009')
ON CONFLICT DO NOTHING;

-- ---------------------------------------------------------------------------
-- Disponibilidades (definem as modalidades de cada médico e, na agenda,
-- os horários livres)
-- ---------------------------------------------------------------------------
INSERT INTO disponibilidades (id, medico_id, unidade_id, dia_semana, inicio, fim, duracao_min, modalidade)
SELECT md5(m.medico || d.dia || m.modalidade || m.inicio)::uuid, m.medico::uuid, m.unidade::uuid, d.dia,
       m.inicio::time, m.fim::time, m.duracao, m.modalidade
FROM (VALUES
    -- médico, unidade, início, fim, duração (min), modalidade, dias (ISO)
    ('c1000000-0000-4000-8000-000000000001', 'a1000000-0000-4000-8000-000000000003', '08:00', '12:00', 30, 'presencial', '{1,2,3,4,5}'),
    ('c1000000-0000-4000-8000-000000000001', 'a1000000-0000-4000-8000-000000000003', '14:00', '18:00', 30, 'online',     '{2,4}'),
    ('c1000000-0000-4000-8000-000000000002', 'a1000000-0000-4000-8000-000000000006', '08:00', '12:00', 30, 'presencial', '{1,2,3,4,5}'),
    ('c1000000-0000-4000-8000-000000000002', 'a1000000-0000-4000-8000-000000000006', '14:00', '18:00', 30, 'online',     '{1,3}'),
    ('c1000000-0000-4000-8000-000000000003', 'a1000000-0000-4000-8000-000000000005', '08:30', '12:30', 30, 'presencial', '{1,2,3,4,5}'),
    ('c1000000-0000-4000-8000-000000000003', 'a1000000-0000-4000-8000-000000000005', '16:00', '18:00', 30, 'online',     '{5}'),
    ('c1000000-0000-4000-8000-000000000004', 'a1000000-0000-4000-8000-000000000004', '09:00', '13:00', 30, 'presencial', '{1,2,3,4,5}'),
    ('c1000000-0000-4000-8000-000000000004', 'a1000000-0000-4000-8000-000000000004', '14:00', '17:00', 30, 'online',     '{2}'),
    ('c1000000-0000-4000-8000-000000000005', 'a1000000-0000-4000-8000-000000000007', '07:00', '12:00', 30, 'presencial', '{1,3,5}'),
    ('c1000000-0000-4000-8000-000000000006', 'a1000000-0000-4000-8000-000000000008', '08:00', '12:00', 20, 'presencial', '{1,2,3,4,5}'),
    ('c1000000-0000-4000-8000-000000000006', 'a1000000-0000-4000-8000-000000000008', '14:00', '18:00', 60, 'domiciliar', '{3}'),
    ('c1000000-0000-4000-8000-000000000007', 'a1000000-0000-4000-8000-000000000009', '09:00', '17:00', 50, 'online',     '{1,2,3,4,5}')
) AS m (medico, unidade, inicio, fim, duracao, modalidade, dias)
CROSS JOIN LATERAL unnest(m.dias::smallint[]) AS d (dia)
ON CONFLICT (id) DO NOTHING;

-- ---------------------------------------------------------------------------
-- Pacientes de demonstração (os da agenda do médico inicial no perfil dev).
-- Mesma senha das contas de médico acima.
-- ---------------------------------------------------------------------------
INSERT INTO usuarios (id, nome_completo, email, senha_hash, telefone, papel, status) VALUES
    ('e1000000-0000-4000-8000-000000000001', 'Ana Paula Ferreira', 'ana.ferreira@demo.saudeplus.com',
     '$2a$10$yqScN9hOcrde4mjK3Zzb4ekjRtQ9FqvqWjYJ4r9IhIrYhuRJH5WeG', '(22) 99811-0001', 'PACIENTE', 'ativo'),
    ('e1000000-0000-4000-8000-000000000002', 'João Gabriel Santos', 'joao.santos@demo.saudeplus.com',
     '$2a$10$yqScN9hOcrde4mjK3Zzb4ekjRtQ9FqvqWjYJ4r9IhIrYhuRJH5WeG', '(22) 99811-0002', 'PACIENTE', 'ativo'),
    ('e1000000-0000-4000-8000-000000000003', 'Mariana Costa', 'mariana.costa@demo.saudeplus.com',
     '$2a$10$yqScN9hOcrde4mjK3Zzb4ekjRtQ9FqvqWjYJ4r9IhIrYhuRJH5WeG', '(22) 99811-0003', 'PACIENTE', 'ativo'),
    ('e1000000-0000-4000-8000-000000000004', 'Carlos Eduardo Lima', 'carlos.lima@demo.saudeplus.com',
     '$2a$10$yqScN9hOcrde4mjK3Zzb4ekjRtQ9FqvqWjYJ4r9IhIrYhuRJH5WeG', '(22) 99811-0004', 'PACIENTE', 'ativo'),
    ('e1000000-0000-4000-8000-000000000005', 'Fernanda Alves', 'fernanda.alves@demo.saudeplus.com',
     '$2a$10$yqScN9hOcrde4mjK3Zzb4ekjRtQ9FqvqWjYJ4r9IhIrYhuRJH5WeG', '(22) 99811-0005', 'PACIENTE', 'ativo'),
    ('e1000000-0000-4000-8000-000000000006', 'Roberto Silva', 'roberto.silva@demo.saudeplus.com',
     '$2a$10$yqScN9hOcrde4mjK3Zzb4ekjRtQ9FqvqWjYJ4r9IhIrYhuRJH5WeG', '(22) 99811-0006', 'PACIENTE', 'ativo'),
    ('e1000000-0000-4000-8000-000000000007', 'Juliana Rocha', 'juliana.rocha@demo.saudeplus.com',
     '$2a$10$yqScN9hOcrde4mjK3Zzb4ekjRtQ9FqvqWjYJ4r9IhIrYhuRJH5WeG', '(22) 99811-0007', 'PACIENTE', 'ativo'),
    ('e1000000-0000-4000-8000-000000000008', 'Lucas Martins', 'lucas.martins@demo.saudeplus.com',
     '$2a$10$yqScN9hOcrde4mjK3Zzb4ekjRtQ9FqvqWjYJ4r9IhIrYhuRJH5WeG', '(22) 99811-0008', 'PACIENTE', 'ativo')
ON CONFLICT (id) DO NOTHING;

INSERT INTO pacientes (id, usuario_id, data_nascimento, sexo) VALUES
    ('f1000000-0000-4000-8000-000000000001', 'e1000000-0000-4000-8000-000000000001', '1994-03-12', 'feminino'),
    ('f1000000-0000-4000-8000-000000000002', 'e1000000-0000-4000-8000-000000000002', '2021-06-02', 'masculino'),
    ('f1000000-0000-4000-8000-000000000003', 'e1000000-0000-4000-8000-000000000003', '1998-01-25', 'feminino'),
    ('f1000000-0000-4000-8000-000000000004', 'e1000000-0000-4000-8000-000000000004', '1981-08-30', 'masculino'),
    ('f1000000-0000-4000-8000-000000000005', 'e1000000-0000-4000-8000-000000000005', '1966-05-14', 'feminino'),
    ('f1000000-0000-4000-8000-000000000006', 'e1000000-0000-4000-8000-000000000006', '1975-02-03', 'masculino'),
    ('f1000000-0000-4000-8000-000000000007', 'e1000000-0000-4000-8000-000000000007', '1989-11-19', 'feminino'),
    ('f1000000-0000-4000-8000-000000000008', 'e1000000-0000-4000-8000-000000000008', '2002-07-07', 'masculino')
ON CONFLICT (id) DO NOTHING;
