-- Foto de perfil enviada pelo próprio usuário (PNG guardado em `saudeplus.arquivos.dir`)
-- e a escolha de mostrá-la na faixa de boas-vindas do painel.
-- `foto_chave` só é preenchida quando a foto foi enviada por aqui; uma foto por
-- endereço https continua só em `foto_url`.
ALTER TABLE usuarios ADD COLUMN foto_chave varchar(60);
ALTER TABLE usuarios ADD COLUMN exibir_foto_no_painel boolean NOT NULL DEFAULT false;

-- A rota pública da foto procura pela chave.
CREATE UNIQUE INDEX uk_usuarios_foto_chave ON usuarios (foto_chave) WHERE foto_chave IS NOT NULL;
