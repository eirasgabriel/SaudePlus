# Dashboard do Médico

Tela do profissional de saúde, na rota `/medico` (perfil `MEDICO`). Nasceu na
branch `feature/dashboard-medico` e hoje recebe os dados da API; as rotas estão
em [api-painel-medico.md](api-painel-medico.md).

## Como abrir

Com o back-end rodando (ver [backend/README.md](../backend/README.md)):

```bash
cd frontend
npm ci
npm run dev
```

Entre em `http://localhost:5173/login` com `medico@saudeplus.com` /
`Medico@SaudePlus2026`. Sem a API, o painel mostra os mocks de `data/medico.js`
com uma faixa avisando (`components/AvisoDeOrigem`).

## O que foi reaproveitado

| Origem (não alterada) | Uso no painel |
| --- | --- |
| `src/styles/tokens.css` | toda a paleta, tipografia, espaçamento, raios e sombras |
| `src/styles/global.css` | reset, `.skip-link`, `.sr-only`, `:focus-visible` |
| `src/components/icons/Icons.jsx` | 12 dos ícones da tela |
| `src/utils/cx.js` | composição de classes |
| padrão de `features/<dominio>/{pages,components,data}` | organização das pastas |
| padrão de `scripts/*.test.mjs` | testes automatizados |

Ícones que não existiam (`HomeIcon`, `FlaskIcon`, `BellIcon`, `ClipboardIcon`,
`DotIcon`) foram criados em `features/medico/components/icons/MedicoIcons.jsx`,
com o mesmo contrato dos ícones do sistema (`currentColor` e prop `size`), em
vez de editar `Icons.jsx`.

## Estrutura

```text
frontend/
├── scripts/medico.test.mjs              testes (npm test já cobre)
└── src/
    ├── app/App.jsx                      rota /medico (protegida, perfil MEDICO)
    └── features/medico/
        ├── medico.api.js                chamadas a /api/medico/*
        ├── usePainelMedico.js           carrega o painel (origem: api ou mocks)
        ├── selectors.js                 regras de leitura e contadores
        ├── data/medico.js               mocks (médico, agenda, pacientes…)
        ├── layouts/
        │   ├── DashboardLayout.jsx      casca: skip-link, header, grade
        │   ├── DashboardHeader.jsx      topo, busca, sino, perfil
        │   ├── DashboardSidebar.jsx     menu lateral
        │   ├── DashboardBrand.jsx       wordmark + slogan
        │   └── navigation.js            itens dos dois menus
        ├── pages/DashboardMedico.jsx    composição da tela
        ├── pages/PainelMedicoConectado.jsx  liga a tela à API (ou aos mocks)
        └── components/
            ├── Panel/                   cartão branco com cabeçalho e ação
            ├── SummaryCard/             os quatro cartões do topo
            ├── WelcomeBanner/           faixa de boas-vindas (único <h1>)
            ├── AgendaList/              lista da agenda + AgendaFilter
            ├── StatusTag/               selo de status da consulta
            ├── PatientList/             lista de pacientes
            ├── PendingExamList/         exames aguardando resultado
            ├── NotificationList/        notificações
            ├── UnitCard/                dados da unidade
            ├── DayAgendaCard/           cartão azul com data e frase
            ├── HighlightCard/           cartões decorativos azul-claro
            ├── AvisoDeOrigem/           faixa "dados de demonstração"
            └── icons/MedicoIcons.jsx    ícones novos
```

## Contrato de dados

`DashboardMedico` aceita tudo por props e usa os mocks só como valor padrão.
`PainelMedicoConectado` passa o retorno de `GET /api/medico/painel` neste formato:

```jsx
<DashboardMedico
  medico={{ nome, perfil, especialidade, crm, avatarUrl }}
  unidade={{ nome, cidade, endereco, telefone, horario, mapUrl }}
  agenda={[{ id, horario: "08:00", pacienteId, tipo, status }]}
  pacientes={[{ id, nome, idade, motivo }]}
  exames={[{ id, nome, pacienteId, prazo }]}
  notificacoes={[{ id, tipo, titulo, detalhe, quando, lida }]}
  dataReferencia="2026-09-15"
/>
```

`status` aceita as chaves do status unificado (`pendente`, `confirmada`,
`aguardando`, `em_andamento`, `realizada`, `cancelada`, `faltou`). Os
rótulos e as cores vêm de `STATUS_CONSULTA`, em `data/medico.js` — acrescentar
um status novo lá faz o selo e o filtro aparecerem sozinhos. `tipo` de
notificação aceita `resultado`, `agendamento` e `retorno`; um tipo desconhecido
cai num padrão em vez de quebrar a tela.

## Contadores

Nenhum número da tela está escrito no JSX. Todos saem de `selectors.js`, e as
definições ficam num lugar só:

| Cartão | Regra |
| --- | --- |
| Consultas hoje | total de itens da agenda |
| Pacientes atendidos | consultas com status concluído (`realizada`) |
| Exames pendentes | total de exames aguardando resultado |
| Próximas consultas | consultas que ainda não começaram, e o horário da primeira |

O contador do sino conta as notificações com `lida: false`. As iniciais do
avatar (`AF`, `JS`…) vêm do primeiro e do último nome do paciente.

### Diferença em relação ao modelo

O modelo enviado traz **5** em "Pacientes atendidos" e **3** em "Próximas
consultas", mas a própria agenda do modelo lista 3 consultas realizadas e 4
ainda não iniciadas. Como os contadores passaram a ser derivados dos dados, a
tela mostra **3** e **4**. Para obter os números do modelo, basta ajustar os
status em `data/medico.js` — a tela acompanha. O mesmo vale para as iniciais de
Carlos Eduardo Lima: o modelo mostra `CE`, a regra de primeiro+último nome gera
`CL` (que é a mesma regra que produz `AF` para Ana Paula Ferreira).

## Acessibilidade

O painel repete o contrato do `MainLayout` institucional: `.skip-link`,
`<main id="conteudo" tabIndex={-1}>`, um único `<h1>` e um único `<main>` por
tela. Além disso:

- cada painel é uma `<section aria-labelledby>` ligada ao próprio `<h2>`;
- a busca do topo usa `aria-expanded`/`aria-controls`, fecha com `Esc` e
  devolve o foco ao botão de origem;
- os filtros da agenda são botões com `aria-pressed`, e a contagem de
  resultados é anunciada por uma região `aria-live="polite"`;
- linhas clicáveis têm nome acessível descritivo ("Abrir consulta de Fernanda
  Alves às 10:40"), e o foco aparece na linha inteira via `:has()`;
- ilustrações e ícones decorativos são `aria-hidden`.

## Testes

`frontend/scripts/medico.test.mjs`, coberto por `npm test`. São 20 testes em
dois blocos:

- **selectors** (10) — iniciais, contadores derivados, soma da contagem por
  status, filtro, integridade dos mocks (toda consulta e todo exame apontam
  para um paciente existente; todo status usado existe em `STATUS_CONSULTA`) e
  o nome do paciente, venha ele pronto da API ou do cadastro local.
  Não dependem do Vite.
- **página** (10) — renderiza `DashboardMedico` via SSR e confere o `<main>` e
  o `<h1>` únicos, o contrato de acessibilidade, as seções do modelo, os
  contadores, uma linha por consulta e o limite de 5 pacientes no painel.

## Pendências conhecidas

- O painel já é a rota `/medico` do React Router (o `medico.html` foi removido
  na integração), mas os `href` do menu ainda são `#`: trocar por
  `to`/`<NavLink>` quando as subpáginas existirem.
- A ilustração de boas-vindas é um SVG provisório. Passe `imagemBoasVindas`
  quando houver a arte final.
- A marca do painel é o wordmark, como no modelo. O `Logo` com o símbolo da
  cruz (usado no site institucional) continua disponível e é uma troca de uma
  linha, caso a equipe decida unificar — ele depende do React Router.
- O slogan aqui está como "A sua **s**aúde", igual ao dashboard do paciente; o
  site institucional usa "A sua **S**aúde". Vale padronizar antes do merge.
