# Área administrativa

O painel do administrador vive em `/admin` e reúne 12 telas. Esta página
descreve como ele está montado; a arquitetura geral do repositório está em
[arquitetura.md](arquitetura.md).

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
- `styles/tokens.css`: só a paleta (`:root`) e as classes de blindagem.
  **Sem reset global**, de propósito: as telas do paciente fazem o próprio
  reset escopado em `.pagina`, e um reset global daqui trocaria a fonte, o
  fundo e os espaçamentos delas. O reset da área administrativa vive escopado
  em `.app`, dentro de `layouts/AdminLayout.module.css`. A única regra global
  que resta é `prefers-reduced-motion`, que é acessibilidade e deve valer para
  o site inteiro.
- `styles/adminComum.module.css` e `adminConfig.module.css`: estilos
  compartilhados entre páginas e entre as abas.

## Estado e dados

Nenhum componente tem texto ou número embutido: tudo vem de
`services/dadosAdmin*.js`. Cada componente recebe os dados por prop, com o mock
apenas como valor padrão, então trocar o mock pela API não exige tocar em
componente nenhum:

```js
// hoje
export const usuarios = [ /* ... */ ];

// depois
export async function buscarUsuarios() {
  const r = await fetch('/api/usuarios');
  return r.json();
}
```

Quando a integração começar, cada `dadosAdmin*.js` migra para
`features/<domínio>/<domínio>.api.js`, como pede a arquitetura.

O estado de interface (filtros, abas, toggles) vive em `useState`, então não
persiste ao recarregar a página — esperado enquanto não há backend.

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

## Dívida conhecida: o `global.css`

`styles/global.css` tem duas regras que atrapalham:

```css
svg { width: 24px !important; height: 24px !important; }
img { max-width: 60px !important; max-height: 60px !important; border-radius: 50%; }
```

Como `!important` vence especificidade, elas anulam **todo** tamanho de ícone
definido em qualquer `.module.css`, e derrubam o logo do `Header` do paciente,
que pede `width="240"` e acaba virando um círculo de 60px.

Enquanto elas existirem, `tokens.css` traz três classes de blindagem —
`.spIcone`, `.spImagem` e `.spLogo` — que protegem a área administrativa por
especificidade. **A correção certa é apagar as duas regras**; depois disso as
três classes podem sair.

## Acessibilidade

`aria-current` nos itens de menu ativos, `aria-label` descritivo nos gráficos
(a rosca e as barras anunciam os valores), `role="switch"` nos toggles,
`aria-expanded` no acordeão, foco visível global e `prefers-reduced-motion`
respeitado em `tokens.css`.
