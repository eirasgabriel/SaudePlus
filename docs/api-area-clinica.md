# Acesso e dashboard da clínica

Cada conta com papel `CLINICA` pertence a uma única unidade. O login usa
`POST /api/auth/login`, com e-mail e senha, e o frontend direciona para
`/clinica`. A senha é armazenada com BCrypt. Recuperação e troca de senha
reutilizam os endpoints de autenticação existentes.

## Cadastro administrativo

`POST /api/admin/unidades` recebe os campos cadastrais existentes e:

- `emailLogin`: obrigatório, único entre todas as contas do sistema.
- `senhaLogin`: obrigatória na criação; mínimo de 8 caracteres, máximo de
  72 bytes UTF-8. Nunca é devolvida pela API.

`email` permanece sendo o contato público da unidade, independente do login.
Unidade e conta são criadas na mesma transação. Uma falha no acesso desfaz
também a criação da unidade.

`PUT /api/admin/unidades/{id}` permite configurar o acesso de unidades antigas,
alterar o e-mail de login e definir uma nova senha. Senha ausente ou vazia
mantém a atual. Para uma unidade antiga ainda sem conta, informe e-mail de
login e senha juntos. A migração não inventa credenciais para registros antigos.

As respostas administrativas de unidade incluem `emailLogin` (nulo enquanto
o acesso não estiver configurado). Não há cadastro público de clínicas.

## Área autenticada

Somente o papel `CLINICA` acessa `/api/clinica/**`:

- `GET /api/clinica/painel`: `{ unidades: [unidadeDaConta], modulos:
  ["clinicas", "agendamentos"] }`, com os indicadores cadastrais da unidade.
- `GET /api/clinica/agendamentos?de=AAAA-MM-DD&ate=AAAA-MM-DD&pagina=0&tamanho=500`:
  envelope paginado de consultas, com o mesmo formato administrativo.

- `GET /api/clinica/medicos`: médicos vinculados à unidade
  (`id`, `nome`, `fotoUrl`, `crm`, `crmUf`, `especialidades`, `status` da conta, `vinculado`).
- `GET /api/clinica/medicos/disponiveis?busca=texto`: até 20 médicos com conta
  ativa ainda não vinculados, por nome ou CRM. Menos de 2 caracteres: 422.
- `POST /api/clinica/medicos` com `{ "medicoId": "uuid" }`: vincula (201).
  Médico inexistente: 404; conta não ativa: 422; já vinculado: 409.
- `DELETE /api/clinica/medicos/{medicoId}`: desvincula (204). Médico fora da
  unidade: 404. Consultas pendentes/confirmadas/aguardando/em andamento a partir
  de hoje nesta unidade: 422. As janelas de disponibilidade do médico nessa
  unidade são removidas junto com o vínculo. Ambas as ações são auditadas.

A clínica não cadastra médicos: eles continuam sendo criados pela administração.

O servidor deriva a unidade da conta autenticada. Um parâmetro `unidadeId`
não altera esse escopo. A clínica não pode acessar `/api/admin/**`,
`/api/paciente/**` ou `/api/medico/**`.

Contas bloqueadas e unidades fora do status `ativa` não podem entrar. A mesma
verificação ocorre em cada uso de um token já emitido. Os papéis de equipe
existentes continuam com suas permissões administrativas anteriores.

## Banco e operação

`V8__acesso_das_clinicas.sql` adiciona o papel `CLINICA` e `usuarios.unidade_id`,
com chave estrangeira, unicidade por unidade e restrição de vínculo para esse
papel. A área da clínica oferece a dashboard e a página `/clinica/conta`
para troca de senha. O administrador configura acessos pelo formulário de
clínicas/unidades, inclusive nas unidades já cadastradas.
