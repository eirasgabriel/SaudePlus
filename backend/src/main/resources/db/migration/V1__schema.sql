-- Schema inicial do SaudePlus.
-- Convenções: ids UUID gerados no banco, instantes em timestamptz (UTC),
-- data/horário de agendamento em date/time locais da unidade, dinheiro em
-- numeric(12,2) e enums como text com CHECK usando a chave que trafega no JSON.

-- ---------------------------------------------------------------------------
-- Usuários e perfis
-- ---------------------------------------------------------------------------
CREATE TABLE usuarios (
    id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    nome_completo varchar(120) NOT NULL,
    email         varchar(180) NOT NULL,
    senha_hash    varchar(100) NOT NULL,
    telefone      varchar(20),
    cpf           varchar(14),
    papel         varchar(20)  NOT NULL
        CHECK (papel IN ('PACIENTE', 'MEDICO', 'ADMIN', 'GESTOR', 'ENFERMEIRO', 'RECEPCIONISTA', 'AGENTE')),
    status        varchar(20)  NOT NULL DEFAULT 'ativo'
        CHECK (status IN ('ativo', 'bloqueado', 'inativo')),
    foto_url      varchar(500),
    ultimo_acesso timestamptz,
    criado_em     timestamptz  NOT NULL DEFAULT now(),
    atualizado_em timestamptz  NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX uk_usuarios_email ON usuarios (lower(email));
CREATE UNIQUE INDEX uk_usuarios_cpf ON usuarios (cpf) WHERE cpf IS NOT NULL;

CREATE TABLE convenios (
    id    uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    nome  varchar(80) NOT NULL UNIQUE,
    ativo boolean     NOT NULL DEFAULT true
);

CREATE TABLE pacientes (
    id                 uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    usuario_id         uuid NOT NULL UNIQUE REFERENCES usuarios (id),
    data_nascimento    date,
    sexo               varchar(20),
    convenio_id        uuid REFERENCES convenios (id),
    numero_carteirinha varchar(40)
);

CREATE TABLE especialidades (
    id        uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    slug      varchar(60)  NOT NULL UNIQUE,
    nome      varchar(80)  NOT NULL,
    descricao varchar(200)
);

CREATE TABLE medicos (
    id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    usuario_id       uuid          NOT NULL UNIQUE REFERENCES usuarios (id),
    crm              varchar(20)   NOT NULL,
    crm_uf           varchar(2)       NOT NULL,
    bio              text,
    valor_consulta   numeric(12,2),
    nota_media       numeric(3,2)  NOT NULL DEFAULT 0,
    total_avaliacoes integer       NOT NULL DEFAULT 0,
    UNIQUE (crm, crm_uf)
);

CREATE TABLE medico_especialidades (
    medico_id        uuid NOT NULL REFERENCES medicos (id) ON DELETE CASCADE,
    especialidade_id uuid NOT NULL REFERENCES especialidades (id),
    PRIMARY KEY (medico_id, especialidade_id)
);

CREATE TABLE medico_convenios (
    medico_id   uuid NOT NULL REFERENCES medicos (id) ON DELETE CASCADE,
    convenio_id uuid NOT NULL REFERENCES convenios (id),
    PRIMARY KEY (medico_id, convenio_id)
);

-- ---------------------------------------------------------------------------
-- Unidades
-- ---------------------------------------------------------------------------
CREATE TABLE unidades (
    id                    uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    nome                  varchar(120) NOT NULL,
    endereco              varchar(200) NOT NULL,
    bairro                varchar(80),
    cidade                varchar(80)  NOT NULL,
    uf                    varchar(2)      NOT NULL,
    telefone              varchar(20),
    horario_funcionamento varchar(200),
    map_url               varchar(500),
    status                varchar(20)  NOT NULL DEFAULT 'ativa'
        CHECK (status IN ('ativa', 'manutencao', 'inativa')),
    criado_em             timestamptz  NOT NULL DEFAULT now()
);

CREATE TABLE medico_unidades (
    medico_id  uuid NOT NULL REFERENCES medicos (id) ON DELETE CASCADE,
    unidade_id uuid NOT NULL REFERENCES unidades (id),
    PRIMARY KEY (medico_id, unidade_id)
);

-- ---------------------------------------------------------------------------
-- Agenda do médico
-- ---------------------------------------------------------------------------
CREATE TABLE disponibilidades (
    id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    medico_id   uuid        NOT NULL REFERENCES medicos (id) ON DELETE CASCADE,
    unidade_id  uuid        NOT NULL REFERENCES unidades (id),
    dia_semana  smallint    NOT NULL CHECK (dia_semana BETWEEN 1 AND 7), -- ISO: 1 = segunda
    inicio      time        NOT NULL,
    fim         time        NOT NULL,
    duracao_min smallint    NOT NULL CHECK (duracao_min BETWEEN 5 AND 240),
    modalidade  varchar(20) NOT NULL DEFAULT 'presencial'
        CHECK (modalidade IN ('presencial', 'online', 'domiciliar')),
    CHECK (inicio < fim)
);
CREATE INDEX ix_disponibilidades_medico ON disponibilidades (medico_id, dia_semana);

CREATE TABLE bloqueios_agenda (
    id        uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    medico_id uuid        NOT NULL REFERENCES medicos (id) ON DELETE CASCADE,
    inicio    timestamptz NOT NULL,
    fim       timestamptz NOT NULL,
    motivo    varchar(200),
    CHECK (inicio < fim)
);
CREATE INDEX ix_bloqueios_medico ON bloqueios_agenda (medico_id, inicio);

-- ---------------------------------------------------------------------------
-- Agendamentos
-- ---------------------------------------------------------------------------
CREATE TABLE agendamentos (
    id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    paciente_id         uuid        NOT NULL REFERENCES pacientes (id),
    medico_id           uuid        NOT NULL REFERENCES medicos (id),
    unidade_id          uuid        NOT NULL REFERENCES unidades (id),
    especialidade_id    uuid        NOT NULL REFERENCES especialidades (id),
    data                date        NOT NULL,
    horario             time        NOT NULL,
    duracao_min         smallint    NOT NULL DEFAULT 30,
    tipo                varchar(20) NOT NULL DEFAULT 'consulta'
        CHECK (tipo IN ('consulta', 'retorno', 'exame')),
    modalidade          varchar(20) NOT NULL DEFAULT 'presencial'
        CHECK (modalidade IN ('presencial', 'online', 'domiciliar')),
    status              varchar(20) NOT NULL DEFAULT 'pendente'
        CHECK (status IN ('pendente', 'confirmada', 'aguardando', 'em_andamento', 'realizada', 'cancelada', 'faltou')),
    motivo              varchar(300),
    resumo              text,
    desfecho            text,
    cancelado_por       uuid REFERENCES usuarios (id),
    motivo_cancelamento varchar(300),
    criado_em           timestamptz NOT NULL DEFAULT now(),
    atualizado_em       timestamptz NOT NULL DEFAULT now()
);
-- Garante no banco que um horário do médico só tem uma reserva ativa, mesmo
-- com duas requisições simultâneas. O service traduz a violação em 409.
CREATE UNIQUE INDEX uk_agendamentos_horario_ativo ON agendamentos (medico_id, data, horario)
    WHERE status NOT IN ('cancelada', 'faltou');
CREATE INDEX ix_agendamentos_medico_data ON agendamentos (medico_id, data);
CREATE INDEX ix_agendamentos_paciente_data ON agendamentos (paciente_id, data);

-- ---------------------------------------------------------------------------
-- Exames
-- ---------------------------------------------------------------------------
CREATE TABLE tipos_exame (
    id                   uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    nome                 varchar(120) NOT NULL UNIQUE,
    categoria            varchar(80)  NOT NULL,
    preparo              text,
    prazo_resultado_dias smallint
);

CREATE TABLE exames (
    id                    uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    paciente_id           uuid        NOT NULL REFERENCES pacientes (id),
    medico_solicitante_id uuid        REFERENCES medicos (id),
    tipo_exame_id         uuid        NOT NULL REFERENCES tipos_exame (id),
    agendamento_origem_id uuid        REFERENCES agendamentos (id),
    unidade_id            uuid        REFERENCES unidades (id),
    data_hora             timestamptz,
    prazo                 date,
    status                varchar(20) NOT NULL DEFAULT 'solicitado'
        CHECK (status IN ('solicitado', 'agendado', 'em_analise', 'liberado', 'cancelado')),
    resultado_path        varchar(500),
    resultado_liberado_em timestamptz,
    criado_em             timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX ix_exames_paciente ON exames (paciente_id);
CREATE INDEX ix_exames_medico_status ON exames (medico_solicitante_id, status);

-- ---------------------------------------------------------------------------
-- Avaliações, notificações e financeiro
-- ---------------------------------------------------------------------------
CREATE TABLE avaliacoes (
    id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    agendamento_id uuid        NOT NULL UNIQUE REFERENCES agendamentos (id),
    paciente_id    uuid        NOT NULL REFERENCES pacientes (id),
    medico_id      uuid        NOT NULL REFERENCES medicos (id),
    nota           smallint    NOT NULL CHECK (nota BETWEEN 1 AND 5),
    comentario     varchar(1000),
    criado_em      timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX ix_avaliacoes_medico ON avaliacoes (medico_id);

CREATE TABLE notificacoes (
    id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    usuario_id uuid         NOT NULL REFERENCES usuarios (id) ON DELETE CASCADE,
    tipo       varchar(20)  NOT NULL
        CHECK (tipo IN ('resultado', 'agendamento', 'retorno', 'cancelamento', 'sistema')),
    titulo     varchar(120) NOT NULL,
    detalhe    varchar(500),
    lida       boolean      NOT NULL DEFAULT false,
    criada_em  timestamptz  NOT NULL DEFAULT now()
);
CREATE INDEX ix_notificacoes_usuario ON notificacoes (usuario_id, lida, criada_em DESC);

CREATE TABLE transacoes (
    id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    paciente_id    uuid          NOT NULL REFERENCES pacientes (id),
    agendamento_id uuid          REFERENCES agendamentos (id),
    descricao      varchar(200)  NOT NULL,
    forma          varchar(20)   NOT NULL
        CHECK (forma IN ('credito', 'debito', 'pix', 'boleto', 'dinheiro', 'convenio')),
    valor          numeric(12,2) NOT NULL CHECK (valor >= 0),
    status         varchar(20)   NOT NULL DEFAULT 'pendente'
        CHECK (status IN ('pago', 'pendente', 'estornado')),
    data_hora      timestamptz   NOT NULL DEFAULT now()
);
CREATE INDEX ix_transacoes_data ON transacoes (data_hora);
CREATE INDEX ix_transacoes_paciente ON transacoes (paciente_id);

-- ---------------------------------------------------------------------------
-- Segurança, configuração e auditoria
-- ---------------------------------------------------------------------------
CREATE TABLE tokens_redefinicao_senha (
    id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    usuario_id  uuid        NOT NULL REFERENCES usuarios (id) ON DELETE CASCADE,
    hash_sha256 varchar(64)    NOT NULL UNIQUE,
    expira_em   timestamptz NOT NULL,
    usado_em    timestamptz,
    criado_em   timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX ix_tokens_usuario ON tokens_redefinicao_senha (usuario_id);

-- Matriz RBAC editável pelo admin: uma linha = papel liberado no módulo.
CREATE TABLE permissoes (
    papel  varchar(20) NOT NULL,
    modulo varchar(40) NOT NULL,
    acao   varchar(20) NOT NULL DEFAULT 'acessar',
    PRIMARY KEY (papel, modulo, acao)
);

CREATE TABLE configuracoes (
    chave         varchar(80) PRIMARY KEY,
    valor         jsonb       NOT NULL,
    atualizado_em timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE registros_atividade (
    id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    usuario_id  uuid REFERENCES usuarios (id) ON DELETE SET NULL,
    acao        varchar(60) NOT NULL,
    entidade    varchar(40),
    entidade_id uuid,
    detalhe     jsonb,
    ip          varchar(45),
    criado_em   timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX ix_registros_criado ON registros_atividade (criado_em DESC);
CREATE INDEX ix_registros_usuario ON registros_atividade (usuario_id, criado_em DESC);
