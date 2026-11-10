# Área administrativa

O painel do administrador vive em `/admin` e reúne 12 telas. Esta página
descreve como ele está montado; a arquitetura geral do repositório está em
[arquitetura.md](arquitetura.md).

> **Dados reais:** dashboard, usuários, clínicas, agendamentos, relatórios,
> financeiro e a matriz de permissões vêm da API (ver [api-admin.md](api-admin.md)
> e [api-financeiro-relatorios.md](api-financeiro-relatorios.md)), por
> `features/admin/pages/AdminConectado.jsx`. Suporte e as demais abas de
> configurações ainda usam os mocks descritos abaixo.

## Rotas

| Caminho | Tela |
| --- | --- |
| `/admin` | Dashboard |
| `/admin/usuarios` | Usuários |
| `/admin/clinicas` | Clínicas |
| `/admin/agendamentos` | Agendamentos |
| `/admin/relatorios` | Relatórios |
| `/admin/financeiro` | Financeiro |
| `/admin/configuracoes` | Configurações (6 abas) |
| `/admin/suporte` | Suporte |

`AdminLayout` desenha o cabeçalho e o menu lateral uma única vez; cada página
entra no `<Outlet />` das rotas filhas, definidas em `app/App.jsx`.

As abas de Configurações ficam na query string — `/admin/configuracoes?aba=seguranca` —
para que o link seja compartilhável e o botão "voltar" do navegador funcione
entre elas.

## Onde fica cada coisa

A área administrativa não tem pasta própria: cada arquivo está na pasta do seu
tipo, como no resto do front-end.

- `layouts/AdminLayout.jsx`: cabeçalho, menu lateral e `<Outlet />`.
- `pages/Admin*Page.jsx`: as 8 páginas. O prefixo `Admin` evita colisão com as
  páginas do paciente — `ClinicasPage.jsx` já existe e é a do paciente.
- `components/`: os 17 componentes reutilizáveis (`Cartao`, `Tabela`, `Icone`,
  `Avatar`, os 4 gráficos...) e as 6 abas de Configurações, que são conteúdo de
  `AdminConfiguracoesPage` e não têm rota própria.
- `services/dadosAdmin*.js`: um arquivo de dados fictícios por tela.
- `services/fotosPacientes.js`: ponto único de importação das fotos.
- `services/useTabela.js`: busca, filtros e paginação, usado por cinco telas.
- `styles/tokens-admin.css`: só a paleta (`:root`) e as classes de blindagem.
  **Sem reset global**, de propósito: as telas do paciente fazem o próprio
  reset escopado em `.pagina`, e um reset global daqui trocaria a fonte, o
  fundo e os espaçamentos delas. O reset da área administrativa vive escopado
  em `.app`, dentro de `layouts/AdminLayout.module.css`. A única regra global
  que resta é `prefers-reduced-motion`, que é acessibilidade e deve valer para
  o site inteiro.
- `styles/adminComum.module.css` e `adminConfig.module.css`: estilos
  compartilhados entre páginas e entre as abas.

## Estado e dados

Nenhum componente tem texto ou número embutido. As páginas recebem tudo por
prop, com os dados de `services/dadosAdmin*.js` apenas como valor padrão.
Quem passa os dados reais é `features/admin/pages/AdminConectado.jsx`, um
componente por rota (`DashboardDoAdmin`, `UsuariosDoAdmin`…):

```jsx
export function FinanceiroDoAdmin() {
  // busca na API, converte com os adaptadores e passa como props
  return <AdminFinanceiroPage metricas={…} transacoes={…} aoAcaoRapida={…} aviso={…} />;
}
```

- `features/admin/admin.api.js` e `exames.api.js`: as chamadas a `/api/admin/*`.
- `features/admin/adaptadores.js`: converte as respostas para o formato dos
  mocks; rótulos, ícones e notas fixas dos cartões continuam vindo dos mocks.
- Sem API, a página fica com os mocks, o `aviso` mostra a faixa de
  demonstração e as ações ficam desligadas.

Filtros, abas e toggles vivem em `useState` e não persistem ao recarregar.

### O hook das tabelas

`useTabela` concentra busca, filtros e paginação. Para adicionar um filtro,
basta descrever como ele testa cada item:

```js
const tabela = useTabela({
  dados: usuarios,
  porPagina: 7,
  camposBusca: ['nome', 'cpf', 'email'],
  valoresIniciais: { status: 'todos' },
  filtros: {
    status: (item, valor) => item.status === valor,
  },
});
```

Os valores `'todos'` e `'todas'` desligam o filtro por convenção. A busca ignora
acento e caixa — "jacone" encontra "Jaconé".

## Gráficos

Os quatro gráficos são CSS e SVG puro, sem biblioteca: `GraficoBarras`,
`GraficoRosca` (via `conic-gradient`), `GraficoLinha` (área com duas séries e
curva suave) e `BarrasHorizontais`.

No `GraficoBarras` a escala é fixa, não o maior valor da série, para que a altura
da barra corresponda de fato ao rótulo do eixo Y.

## Fotos dos pacientes

Ficam em `assets/images/pacientes/`, recortadas em quadrado (160×160, foco no
rosto) e otimizadas — 29 KB no total. O recorte importa porque o avatar é
circular com `object-fit: cover`: em foto de corpo inteiro o centro cai no peito.

`services/fotosPacientes.js` expõe `fotoDoPaciente(nome)`, que casa por prefixo,
porque o mesmo paciente aparece como "Maria Silva" na Dashboard e "Maria Silva
Santos" em Usuários. Quem não tem foto cai no fallback de iniciais sobre cor.

## Classes de blindagem

`styles/tokens-admin.css` traz `.spIcone`, `.spImagem` e `.spLogo`. Elas
protegem ícones e imagens de duas regras com `!important` (`svg` fixo em 24px
e `img` em 60px, redondo). Essas regras saíram do `global.css` e hoje vivem em
`styles/area-paciente.css`, restritas ao `.area-paciente`: na administração
não valem mais. As classes só fazem diferença se `Icone` ou `Avatar` forem
usados dentro da área do paciente; fora disso, podem sair.

## Acessibilidade

`aria-current` nos itens de menu ativos, `aria-label` descritivo nos gráficos
(a rosca e as barras anunciam os valores), `role="switch"` nos toggles,
`aria-expanded` no acordeão, foco visível global e `prefers-reduced-motion`
respeitado em `tokens-admin.css`.
