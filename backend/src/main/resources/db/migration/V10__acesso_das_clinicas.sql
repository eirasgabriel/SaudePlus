-- Uma conta própria por unidade. As contas existentes permanecem inalteradas.
ALTER TABLE usuarios DROP CONSTRAINT usuarios_papel_check;
ALTER TABLE usuarios ADD CONSTRAINT usuarios_papel_check CHECK
    (papel IN ('PACIENTE', 'MEDICO', 'ADMIN', 'CLINICA', 'GESTOR', 'ENFERMEIRO', 'RECEPCIONISTA', 'AGENTE'));
ALTER TABLE usuarios ADD COLUMN unidade_id uuid REFERENCES unidades(id);
ALTER TABLE usuarios ADD CONSTRAINT uk_usuarios_unidade UNIQUE (unidade_id);
ALTER TABLE usuarios ADD CONSTRAINT ck_usuario_clinica_unidade CHECK
    ((papel = 'CLINICA' AND unidade_id IS NOT NULL) OR (papel <> 'CLINICA' AND unidade_id IS NULL));
