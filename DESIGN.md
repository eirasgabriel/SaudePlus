---
name: SaúdePlus
description: Busca de profissionais, agendamento e gestão clínica num só sistema.
colors:
  navy-950: "#020F45"
  navy-900: "#041A58"
  navy-800: "#042B78"
  navy-700: "#06378F"
  shell-raised: "#0A2468"
  primary: "#0070E8"
  primary-hover: "#005EC3"
  primary-dark: "#004A99"
  accent-cyan: "#44C6F4"
  primary-light: "#EAF4FF"
  page-ground: "#F0F7FD"
  surface: "#FFFFFF"
  surface-muted: "#F3F8FD"
  hairline: "#D9E6F6"
  hairline-strong: "#C3D6EF"
  text-muted: "#3C4A70"
  text-soft: "#4A5E86"
  text-subtle: "#6B7FA6"
  shell-text-muted: "#B8C7EB"
  state-pending: "#8A5300"
  state-pending-bg: "#FDF1D8"
  state-success: "#0F6B4F"
  state-success-bg: "#DDF4EA"
  state-danger: "#A3201F"
  state-danger-bg: "#FCE6E5"
  state-progress: "#06378F"
  state-progress-bg: "#DCE6FA"
typography:
  display:
    fontFamily: "Atkinson Hyperlegible Next, Atkinson Hyperlegible, system-ui, sans-serif"
    fontSize: "54px"
    fontWeight: 800
    lineHeight: 1.02
    letterSpacing: "-0.03em"
  headline:
    fontFamily: "Atkinson Hyperlegible Next, Atkinson Hyperlegible, system-ui, sans-serif"
    fontSize: "32px"
    fontWeight: 700
    lineHeight: 1.1
    letterSpacing: "-0.022em"
  title:
    fontFamily: "Atkinson Hyperlegible Next, Atkinson Hyperlegible, system-ui, sans-serif"
    fontSize: "18px"
    fontWeight: 700
    lineHeight: 1.25
  body:
    fontFamily: "Atkinson Hyperlegible Next, Atkinson Hyperlegible, system-ui, sans-serif"
    fontSize: "16px"
    fontWeight: 400
    lineHeight: 1.5
  label:
    fontFamily: "Atkinson Hyperlegible Next, Atkinson Hyperlegible, system-ui, sans-serif"
    fontSize: "12px"
    fontWeight: 600
    lineHeight: 1.3
rounded:
  tag: "4px"
  control: "8px"
  card: "12px"
  shed: "28px"
  shed-lg: "72px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "16px"
  lg: "24px"
  xl: "32px"
  section: "56px"
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.surface}"
    rounded: "{rounded.control}"
    padding: "0 20px"
    height: "44px"
  button-primary-hover:
    backgroundColor: "{colors.primary-hover}"
  button-outline:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.primary-dark}"
    rounded: "{rounded.control}"
    height: "44px"
  button-on-shell:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.navy-900}"
    rounded: "{rounded.control}"
    height: "56px"
  input:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.navy-950}"
    rounded: "{rounded.control}"
    height: "50px"
  card:
    backgroundColor: "{colors.surface}"
    rounded: "{rounded.card}"
    padding: "20px"
  status-tag:
    rounded: "{rounded.tag}"
    typography: "{typography.label}"
    padding: "0 10px"
    height: "26px"
---

# Design System: SaúdePlus

## Overview

**Creative North Star: "Modulado"**

SaúdePlus é desenhado como um edifício modular dos hospitais da Rede Sarah (Lelé, painéis de Athos Bulcão): uma estrutura azul-marinho, como aço pintado, que carrega todas as áreas, e superfícies brancas de trabalho penduradas nela. A casca é a mesma no site público, no login e nos painéis do paciente, do médico e da equipe: o visitante e o profissional reconhecem o mesmo produto.

Depth vem de traço, não de sombra. As superfícies se separam por linhas finas; grades de itens (especialidades, atalhos, motivos) viram paredes de ladrilhos com junta de 1px. Uma única curva grande, a "shed", marca onde a casca encontra o conteúdo — no fim do hero, no canto da área de trabalho dos painéis, no topo do rodapé, nas peças marinho de chamada para ação.

A assinatura funcional é o glifo de progresso: o status de consultas e agendamentos é um disco que se preenche conforme o atendimento avança e fica riscado quando ele é cancelado. Forma, cor e texto juntos — o estado nunca depende só da cor.

**Key Characteristics:**
- Casca azul-marinho em L (topo + lateral) nos painéis; faixa marinho no topo do site e das telas avulsas.
- Superfícies brancas com traço fino; sombra só em elementos flutuantes.
- Curva "shed" única por encontro casca/conteúdo.
- Glifo de progresso em todo selo de status de atendimento.
- Atkinson Hyperlegible Next em toda a interface; algarismos tabulares em horários, datas e valores.

## Colors

Paleta azul fixada pela marca: marinho para estrutura, azul para ação, ciano para foco e item ativo sobre a casca, e cores de estado apenas onde carregam significado.

### Primary
- **Azul Cartilha** (#0070E8): ação principal, links e seleção sobre fundo claro. Hover em Azul Cartilha Profundo (#005EC3); texto azul sobre claro em Azul Tinta (#004A99).
- **Marinho Estrutura** (#041A58): a casca — cabeçalhos, menus laterais, rodapé, peças de chamada, item selecionado em listas de horário e paginação. Títulos usam o Marinho Noite (#020F45).

### Secondary
- **Ciano Sinal** (#44C6F4): só sobre a casca marinho — anel de foco, ícone do item ativo, destaque em títulos do hero e da marca. Nunca como texto sobre fundo claro.

### Neutral
- **Céu de Página** (#F0F7FD): fundo da área de trabalho e das páginas.
- **Branco Superfície** (#FFFFFF): cartões, tabelas, formulários.
- **Traço** (#D9E6F6) e **Traço Firme** (#C3D6EF): divisórias, juntas de ladrilho, bordas de controles.
- **Tinta Apoio** (#3C4A70 / #4A5E86 / #6B7FA6): texto secundário, rótulos e placeholders, todos ≥ 4.5:1 sobre branco.
- **Névoa da Casca** (#B8C7EB): texto secundário sobre marinho (8.9:1).

### Named Rules
**The Estrutura Rule.** Marinho é estrutura, não decoração: aparece na casca e em no máximo uma peça de chamada por tela.
**The Cor-é-Estado Rule.** Verde, âmbar e vermelho só aparecem em selos de estado, avisos e variações de indicador — nunca em ícones decorativos ou séries de gráfico.
**The Ciano-na-Casca Rule.** Ciano só existe sobre marinho.

## Typography

**Display Font:** Atkinson Hyperlegible Next (com Atkinson Hyperlegible, system-ui)
**Body Font:** Atkinson Hyperlegible Next

**Character:** uma face criada para máxima legibilidade, coerente com um público que inclui idosos e pessoas com baixa visão; o peso extra-negrito dá ao hero a voz da marca sem precisar de outra família.

### Hierarchy
- **Display** (800, 54px → 36px no celular, 1.02): títulos do hero público.
- **Headline** (700, 28–34px, 1.1): títulos de página e de seção.
- **Title** (700, 16–18px, 1.25): títulos de cartão, nomes de profissionais, especialidades.
- **Body** (400, 16px, 1.5): texto corrido; máximo de 65–75ch.
- **Label** (600, 12–13px): rótulos de campo, selos de status, cabeçalhos de tabela.

### Named Rules
**The Tabular Rule.** Horários, datas, contagens e valores sempre em algarismos tabulares.

## Layout

Container público de 1280px com margem de 32px (16px no celular). Painéis: casca em L com lateral de 240px (72px só com ícones abaixo de 900px no admin), área de trabalho com padding de 32px. Ritmo de 4/8px; seções públicas separadas por 56px. Grades de itens equivalentes usam a "parede de ladrilhos": `gap: 1px` sobre o fundo de traço. Em telas estreitas a lateral vira faixa horizontal ou some, e o menu do topo assume.

## Elevation & Depth

Plano por padrão. Profundidade vem do contraste casca/superfície e de linhas finas. Sombra existe só para o que flutua sobre o conteúdo.

### Shadow Vocabulary
- **Flutuante** (`box-shadow: 0 18px 40px -12px rgba(2, 15, 69, 0.28)`): régua de busca, avisos sobre a arte do hero, modal de agendamento, painéis que descem do cabeçalho.

### Named Rules
**The Traço-não-Sombra Rule.** Cartões e painéis em repouso não têm sombra; hover muda a cor do traço ou inverte a peça para marinho.

## Shapes

Cantos curtos e consistentes: 4px em selos e horários, 8px em controles e botões, 12px em cartões. A curva "shed" (28px nos painéis, 72px no público) é a única exceção, e aparece só onde a casca encontra o conteúdo: hero, área de trabalho, rodapé, faixa de chamada, peças marinho (agenda do dia, agendar consulta, contato) e o cabeçalho do modal.

## Components

### Buttons
- **Shape:** retangular, canto de 8px, altura mínima de 44px.
- **Primary:** Azul Cartilha com texto branco; hover em Azul Cartilha Profundo.
- **Outline:** branco com Traço Firme e texto Azul Tinta; hover acende a borda azul e o fundo azul-claro.
- **Sobre a casca:** branco sólido com texto marinho (ação principal do hero e de faixas) ou contorno branco translúcido (ação secundária).

### Status (Signature Component)
- **Selo:** retângulo de 4px, rótulo 12px/600, fundo claro do estado.
- **Glifo de progresso:** disco de 11px com traço de 1.5px, preenchido por fatia: pendente ¼, confirmada ½, aguardando ⅝, em andamento ¾, realizada inteiro; cancelada e não compareceu vazias com risco diagonal. Itens cancelados permanecem na lista, com nome e hora riscados.

### Cards / Containers
- **Corner Style:** 12px.
- **Background:** Branco Superfície sobre Céu de Página.
- **Shadow Strategy:** nenhuma em repouso.
- **Border:** 1px Traço; cabeçalho separado do corpo por divisória.
- **Internal Padding:** 20–24px.

### Inputs / Fields
- **Style:** branco, 1px Traço Firme, canto de 8px, 42–50px de altura, rótulo visível acima.
- **Focus:** borda Azul Cartilha + halo de 3px azul translúcido.
- **Error:** borda e mensagem em vermelho de estado, logo abaixo do campo.

### Navigation
- **Casca:** itens em Névoa da Casca; hover clareia o fundo; ativo com fundo ciano translúcido, ícone ciano e texto branco em negrito. No cabeçalho público, o ativo ganha um marcador ciano de 3px colado à base da faixa.
- **Uma só navegação por painel:** a lateral; o menu do topo aparece apenas quando a lateral some.

### Search Bar
A busca pública é uma régua única: campos dividindo a mesma moldura, separados por traços finos, e o botão encostado na ponta direita.

## Do's and Don'ts

### Do:
- **Do** usar o marinho (#041A58) para toda estrutura de navegação e para uma única peça de chamada por tela.
- **Do** colocar o glifo de progresso em todo status de consulta/agendamento, sempre com texto.
- **Do** separar itens equivalentes com junta de 1px (parede de ladrilhos) em vez de cartões soltos com sombra.
- **Do** manter rótulos de campo visíveis e o anel de foco: azul sobre claro, ciano sobre marinho.

### Don't:
- **Don't** usar gradientes decorativos, ondas ou vidro em cartões e faixas.
- **Don't** usar verde, roxo, rosa ou âmbar como cor de ícone ou de série de gráfico; séries usam a família azul.
- **Don't** colocar rótulo/kicker acima de títulos; frases de apoio vão abaixo do texto.
- **Don't** repetir a mesma navegação no topo e na lateral.
- **Don't** usar pílulas arredondadas em botões; o raio de 8px é a forma dos controles.
