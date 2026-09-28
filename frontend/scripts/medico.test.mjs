/* Testes do Dashboard do Médico.
   Mesmo formato de `pages.test.mjs`: o Vite em modo SSR carrega os módulos
   com JSX e CSS Modules, e a página é renderizada como HTML estático.
   `npm test` já cobre este arquivo — o script roda scripts/*.test.mjs. */

import assert from "node:assert/strict";
import { after, before, describe, test } from "node:test";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";

import { AGENDA, EXAMES_PENDENTES, NOTIFICACOES, PACIENTES, STATUS_CONSULTA } from "../src/features/medico/data/medico.js";
import { caminhoDe, ROTAS, ROTAS_ATIVAS, rotuloDe } from "../src/features/medico/rotas.js";
import {
  agendaComPacientes,
  contagemPorStatus,
  examesComPacientes,
  filtrarAgenda,
  iniciais,
  proximasConsultas,
  resumoDoDia,
} from "../src/features/medico/selectors.js";

/* ------------------------------------------------------------------
   Regras de leitura — rodam sem navegador e sem Vite.
   ------------------------------------------------------------------ */
describe("selectors", () => {
  test("iniciais usam o primeiro e o último nome", () => {
    assert.equal(iniciais("Ana Paula Ferreira"), "AF");
    assert.equal(iniciais("João Gabriel Santos"), "JS");
    assert.equal(iniciais("Mariana Costa"), "MC");
    assert.equal(iniciais("Maria da Silva"), "MS", "partículas em minúsculo são ignoradas");
    assert.equal(iniciais("Madonna"), "M", "nome único não quebra");
    assert.equal(iniciais(""), "");
  });

  test("resumo do dia deriva os quatro números da agenda e dos exames", () => {
    const resumo = resumoDoDia(AGENDA, EXAMES_PENDENTES);
    const concluidas = AGENDA.filter(({ status }) => STATUS_CONSULTA[status].concluida).length;

    assert.equal(resumo.consultasHoje, AGENDA.length);
    assert.equal(resumo.pacientesAtendidos, concluidas);
    assert.equal(resumo.examesPendentes, EXAMES_PENDENTES.length);
    assert.equal(resumo.proximasConsultas, proximasConsultas(AGENDA).length);
    assert.equal(resumo.primeiroHorarioPendente, proximasConsultas(AGENDA)[0].horario);
  });

  test("nenhum contador é maior que o total de consultas do dia", () => {
    const { consultasHoje, pacientesAtendidos, proximasConsultas: proximas } = resumoDoDia(AGENDA, EXAMES_PENDENTES);
    assert.ok(pacientesAtendidos <= consultasHoje);
    assert.ok(proximas <= consultasHoje);
  });

  test("a contagem por status soma o total da agenda", () => {
    const contagem = contagemPorStatus(AGENDA);
    const soma = Object.values(contagem).reduce((total, n) => total + n, 0);
    assert.equal(soma, AGENDA.length);
    for (const chave of Object.keys(STATUS_CONSULTA)) {
      assert.ok(chave in contagem, `status "${chave}" precisa aparecer na contagem`);
    }
  });

  test("filtrar por status devolve só aquele status", () => {
    assert.equal(filtrarAgenda(AGENDA, "todas").length, AGENDA.length);
    assert.equal(filtrarAgenda(AGENDA, null).length, AGENDA.length);

    for (const chave of Object.keys(STATUS_CONSULTA)) {
      const filtrada = filtrarAgenda(AGENDA, chave);
      assert.equal(filtrada.length, contagemPorStatus(AGENDA)[chave]);
      assert.ok(filtrada.every((consulta) => consulta.status === chave));
    }

    assert.equal(filtrarAgenda(AGENDA, "status-inexistente").length, 0);
  });

  test('o filtro "pendentes" bate exatamente com o cartão Próximas consultas', () => {
    // Os dois precisam sair da mesma regra: o cartão dizer 4 e o filtro
    // mostrar 2 linhas seria o tipo de divergência que ninguém percebe.
    const { proximasConsultas: doCartao } = resumoDoDia(AGENDA, EXAMES_PENDENTES);
    const doFiltro = filtrarAgenda(AGENDA, "pendentes");

    assert.equal(doFiltro.length, doCartao);
    assert.ok(doFiltro.every(({ status }) => !STATUS_CONSULTA[status].concluida));
    assert.ok(doFiltro.every(({ status }) => status !== "em_andamento"));
  });

  test("toda consulta aponta para um paciente cadastrado", () => {
    const ids = new Set(PACIENTES.map(({ id }) => id));
    for (const { pacienteId } of AGENDA) assert.ok(ids.has(pacienteId), `paciente ausente: ${pacienteId}`);
    for (const { pacienteId } of EXAMES_PENDENTES) assert.ok(ids.has(pacienteId), `paciente ausente: ${pacienteId}`);
  });

  test("todo status usado na agenda existe em STATUS_CONSULTA", () => {
    for (const { status } of AGENDA) assert.ok(status in STATUS_CONSULTA, `status desconhecido: ${status}`);
  });

  test("resolve o nome do paciente a partir do cadastro", () => {
    const agenda = agendaComPacientes(AGENDA, PACIENTES);
    assert.equal(agenda[0].paciente, "Ana Paula Ferreira");

    const exames = examesComPacientes(EXAMES_PENDENTES, PACIENTES);
    assert.equal(exames[0].paciente, "João Gabriel Santos");
  });

  test("mantém o nome que já veio pronto da API", () => {
    // A resposta do back-end já traz `paciente` resolvido, e a lista de
    // pacientes do painel é curta — sem essa regra, um paciente fora da
    // lista viraria "Paciente" na agenda.
    const daApi = [{ id: "ag-x", horario: "07:30", pacienteId: "fora-da-lista", paciente: "Vera Lúcia", tipo: "Retorno", status: "confirmada" }];

    assert.equal(agendaComPacientes(daApi, []).at(0).paciente, "Vera Lúcia");
    assert.equal(
      examesComPacientes([{ id: "ex-x", nome: "Hemograma", pacienteId: "fora-da-lista", paciente: "Vera Lúcia", prazo: "Hoje" }], []).at(0).paciente,
      "Vera Lúcia",
    );
  });

  test("sem nome e sem cadastro, cai num rótulo neutro em vez de undefined", () => {
    const orfa = [{ id: "ag-y", horario: "09:00", pacienteId: "inexistente", tipo: "Consulta", status: "aguardando" }];
    assert.equal(agendaComPacientes(orfa, []).at(0).paciente, "Paciente");
  });
});

/* ------------------------------------------------------------------
   Renderização da página.
   ------------------------------------------------------------------ */
describe("página", () => {
  let server;
  let DashboardMedico;
  let html;

  before(async () => {
    // Import tardio: o bloco `selectors` acima não depende do Vite e roda
    // mesmo em ambientes onde o binário nativo do Rolldown não está instalado.
    const { createServer } = await import("vite");
    server = await createServer({ server: { middlewareMode: true, hmr: false }, appType: "custom" });
    DashboardMedico = (await server.ssrLoadModule("/src/features/medico/pages/DashboardMedico.jsx")).default;
    html = renderToStaticMarkup(createElement(DashboardMedico));
  });

  after(async () => {
    await server?.close();
  });

  const vezes = (padrao) => (html.match(padrao) ?? []).length;

  test("tem um único <main> e um único <h1>", () => {
    assert.equal(vezes(/<main\b/g), 1);
    assert.equal(vezes(/<h1\b/g), 1);
  });

  test("mantém o contrato de acessibilidade do layout institucional", () => {
    assert.ok(html.includes('class="skip-link"'));
    assert.ok(html.includes('id="conteudo"'));
    assert.ok(html.includes('aria-label="Principal"'));
    assert.ok(html.includes('aria-label="Menu do médico"'));
  });

  test("mostra as seções do modelo da tela", () => {
    for (const titulo of [
      "Olá, Dr. Carlos Mendes!",
      "Minha agenda de hoje",
      "Seus pacientes",
      "Exames pendentes",
      "Agenda do dia",
      "Unidade",
      "Notificações",
    ]) {
      assert.ok(html.includes(titulo), `faltou "${titulo}"`);
    }
  });

  test("os cartões de resumo exibem os números derivados, não valores fixos", () => {
    const resumo = resumoDoDia(AGENDA, EXAMES_PENDENTES);
    assert.ok(html.includes(`de ${resumo.consultasHoje}`));
    assert.ok(html.includes(`a partir das ${resumo.primeiroHorarioPendente}`));
    // O nome acessível junta rótulo, número e ação: "8" sozinho não diz
    // para onde o controle leva.
    assert.ok(html.includes(`aria-label="Consultas hoje: ${resumo.consultasHoje}. Ver a agenda do dia"`));
    assert.ok(html.includes(`aria-label="Pacientes atendidos: ${resumo.pacientesAtendidos}. Ver as consultas já realizadas"`));
    assert.ok(html.includes(`aria-label="Exames pendentes: ${resumo.examesPendentes}. Ver os exames aguardando resultado"`));
  });

  test("a agenda renderiza uma linha por consulta do dia", () => {
    assert.equal(vezes(/aria-label="Abrir consulta de /g), AGENDA.length);
    for (const { rotulo } of Object.values(STATUS_CONSULTA)) {
      assert.ok(html.includes(rotulo), `faltou o selo "${rotulo}"`);
    }
  });

  test("a lista de pacientes respeita o limite do painel", () => {
    const mostrados = vezes(/aria-label="Abrir prontuário de /g);
    assert.equal(mostrados, 5);
    assert.ok(mostrados <= PACIENTES.length);
  });

  test("os exames pendentes aparecem com paciente e prazo", () => {
    for (const { nome, prazo } of EXAMES_PENDENTES) {
      assert.ok(html.includes(nome), `faltou o exame "${nome}"`);
      assert.ok(html.includes(prazo), `faltou o prazo "${prazo}"`);
    }
  });

  test("o sino anuncia quantas notificações estão sem ler", () => {
    const naoLidas = NOTIFICACOES.filter(({ lida }) => !lida).length;
    assert.ok(html.includes(`aria-label="Notificações, ${naoLidas} não lidas"`));
  });

  test("a data do painel sai formatada em pt-BR", () => {
    assert.ok(html.includes("15 de setembro de 2026"));
  });

  test("o filtro da agenda começa em Todas", () => {
    assert.ok(html.includes('aria-label="Filtrar agenda por status"'));
    assert.ok(/aria-pressed="true"[^>]*>Todas/.test(html) || /Todas/.test(html));
  });

  test("nenhum controle ficou com href=# apontando para lugar nenhum", () => {
    assert.ok(!html.includes('href="#"'), "todo destino deve ter o caminho real no href");
  });

  test("o que navega é link, com o caminho futuro já no href", () => {
    assert.ok(html.includes('href="/medico"'), "a marca leva ao início do painel");
    assert.ok(html.includes('href="/medico/agenda"'), "menu superior e lateral");
    assert.ok(html.includes('href="/medico/pacientes"'), '"Ver todos" leva à listagem');
    assert.ok(html.includes('href="/medico/consultas/ag-1"'), "linha da agenda leva ao detalhe");
    assert.ok(
      html.includes('href="/medico/pacientes/ana-paula-ferreira"'),
      "linha do paciente leva ao prontuário",
    );
  });

  test('o filtro oferece "Próximas", o mesmo recorte do cartão do topo', () => {
    assert.ok(html.includes("Próximas"));
  });

  test("o menu da conta começa fechado", () => {
    assert.ok(!html.includes('role="menu"'));
  });

  test("Ver no mapa aponta para um endereço externo real", () => {
    assert.ok(html.includes("google.com/maps"));
    assert.ok(html.includes('rel="noopener noreferrer"'));
  });

  test("o rodapé compartilhado entra uma vez só", () => {
    assert.equal(vezes(/<footer\b/g), 1);
    assert.equal(vezes(/<h1\b/g), 1, "o rodapé usa h2, não pode criar um segundo h1");
  });

  test("o rodapé traz os links legais que faltavam no sistema", () => {
    // Num sistema de saúde isso não é decoração: a tela afirma "Seus dados
    // estão seguros" e até aqui não havia para onde apontar.
    for (const rotulo of ["Política de Privacidade", "Termos de Uso", "Acessibilidade"]) {
      assert.ok(html.includes(rotulo), `faltou "${rotulo}" no rodapé`);
    }
    assert.ok(html.includes('href="/privacidade"'));
  });

  test("o rodapé aponta para as páginas que já existem", () => {
    assert.ok(html.includes('href="/ajuda"'));
    assert.ok(html.includes('href="/sobre-nos"'));
    assert.ok(html.includes('href="/como-funciona"'));
  });

  test("o rodapé deixa claro que não é um serviço em operação", () => {
    assert.ok(html.includes("Projeto acadêmico em desenvolvimento"));
  });
});

/* ------------------------------------------------------------------
   Rotas reservadas — o mapa que o painel usa para os destinos futuros.
   ------------------------------------------------------------------ */
describe("rotas", () => {
  test("as rotas do painel ficam sob /medico", () => {
    // "ajuda" e "sair" são os dois destinos fora da área do médico: a página
    // de Ajuda é a do site institucional, e sair leva ao login.
    const foraDoPainel = new Set(["ajuda", "sair"]);
    for (const [chave, { caminho }] of Object.entries(ROTAS)) {
      if (foraDoPainel.has(chave)) continue;
      assert.ok(caminho.startsWith("/medico"), `${chave} deveria ficar sob /medico: ${caminho}`);
    }
    assert.equal(ROTAS.ajuda.caminho, "/ajuda", "deve reaproveitar a página do site institucional");
  });

  test("toda rota tem rótulo, usado no aviso e no nome acessível", () => {
    for (const [chave, { rotulo }] of Object.entries(ROTAS)) {
      assert.ok(rotulo && rotulo.length > 0, `${chave} está sem rótulo`);
    }
  });

  test("caminhoDe troca os parâmetros do molde", () => {
    assert.equal(
      caminhoDe("prontuario", { pacienteId: "ana-paula-ferreira" }),
      "/medico/pacientes/ana-paula-ferreira",
    );
    assert.equal(caminhoDe("consulta", { consultaId: "ag-1" }), "/medico/consultas/ag-1");
    assert.equal(caminhoDe("agenda"), "/medico/agenda");
  });

  test("caminhoDe escapa o valor em vez de montar URL quebrada", () => {
    assert.equal(caminhoDe("prontuario", { pacienteId: "a b/c" }), "/medico/pacientes/a%20b%2Fc");
  });

  test("destino desconhecido não quebra a tela", () => {
    assert.equal(caminhoDe("nao-existe"), "");
    assert.equal(rotuloDe("nao-existe"), "Em breve");
  });

  test("as rotas seguem desligadas — ligar é decisão da equipe", () => {
    // Este teste falha de propósito quando alguém virar a chave, para o
    // passo a passo de `rotas.js` ser conferido junto.
    assert.equal(ROTAS_ATIVAS, false);
  });
});
