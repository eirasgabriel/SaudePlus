-- CNPJ e e-mail da unidade, exibidos em Configurações › Clínicas e Unidades.
-- Opcionais: as unidades já cadastradas continuam válidas sem eles.
ALTER TABLE unidades ADD COLUMN cnpj varchar(18);
ALTER TABLE unidades ADD COLUMN email varchar(180);

-- O CNPJ é gravado sempre formatado (ver comum/Cnpj), então o índice compara igual.
CREATE UNIQUE INDEX uk_unidades_cnpj ON unidades (cnpj) WHERE cnpj IS NOT NULL;
