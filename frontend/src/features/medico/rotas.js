/* ============================================================================
   MAPA DE ROTAS DO PAINEL DO MÉDICO
   ============================================================================

   Este arquivo é o único lugar que conhece os endereços das telas do médico.
   Nenhum componente escreve caminho na mão: todos pedem um destino pelo nome
   (`irPara("agenda")`) e quem resolve é o NavegacaoProvider.

   ---------------------------------------------------------------------------
   COMO ATIVAR UMA TELA NOVA
   ---------------------------------------------------------------------------

   Antes existia um interruptor global (`ROTAS_ATIVAS`), de quando NENHUMA
   tela da área logada existia. Hoje `/medico` já está no roteador, então a
   marcação virou por destino: cada rota diz se já `existe`.

   Para ligar uma tela nova são dois passos:

   1. Declare a rota em `src/app/App.jsx`, dentro da área do médico. Hoje ela
      é uma rota simples; para ganhar filhas, vire um layout route:

        <Route path="/medico" element={
          <RotaProtegida permitir={['MEDICO']}><PainelMedicoConectado /></RotaProtegida>
        } />

        // vira:

        <Route path="/medico" element={<RotaProtegida permitir={['MEDICO']}><AreaMedico /></RotaProtegida>}>
          <Route index element={<PainelMedicoConectado />} />
          <Route path="agenda" element={<Agenda />} />
          <Route path="consultas/:consultaId" element={<DetalheConsulta />} />
        </Route>

      Os caminhos abaixo já estão escritos nesse formato — é só copiar.

   2. Troque `existe: false` para `true` na linha correspondente aqui.

   Não precisa mexer em mais nada: o `LinkDestino` passa a renderizar um
   `<Link>` de verdade e o `irPara` passa a navegar, sem tocar em nenhum
   componente da tela.
   ========================================================================= */

/**
 * Destinos do painel.
 *
 * `caminho` usa a sintaxe do React Router (`:parametro`).
 * `rotulo`  é o que aparece no aviso e no `aria-label` dos controles.
 * `existe`  diz se a rota já está declarada no App.jsx. Enquanto for `false`,
 *           clicar abre um aviso de "em breve" mostrando para onde o botão
 *           vai levar — nada fica morto e nada mente para quem usa.
 */
export const ROTAS = {
  /* Já no roteador. */
  inicio: { caminho: "/medico", rotulo: "Início", existe: true },

  agenda: { caminho: "/medico/agenda", rotulo: "Minha agenda", existe: true },
  consultas: { caminho: "/medico/consultas", rotulo: "Consultas", existe: true },
  consulta: { caminho: "/medico/consultas/:consultaId", rotulo: "Detalhe da consulta", existe: true },
  exames: { caminho: "/medico/exames", rotulo: "Exames", existe: true },
  exame: { caminho: "/medico/exames/:exameId", rotulo: "Detalhe do exame", existe: true },
  pacientes: { caminho: "/medico/pacientes", rotulo: "Pacientes", existe: true },
  prontuario: { caminho: "/medico/pacientes/:pacienteId", rotulo: "Prontuário do paciente", existe: true },
  unidade: { caminho: "/medico/unidade", rotulo: "Unidade", existe: true },
  notificacoes: { caminho: "/medico/notificacoes", rotulo: "Notificações", existe: true },
  conta: { caminho: "/medico/conta", rotulo: "Minha conta", existe: true },
  busca: { caminho: "/medico/busca", rotulo: "Busca", existe: true },

  /* Reservada: as preferências do médico ainda não têm tela. A configuração
     da agenda (janelas e bloqueios) fica em "Minha agenda". */
  configuracoes: { caminho: "/medico/configuracoes", rotulo: "Configurações", existe: false },

  /* Fora da área do médico, no site institucional — já existe. */
  ajuda: { caminho: "/ajuda", rotulo: "Ajuda", existe: true },

  /* "Sair" não é uma rota: é uma ação. O NavegacaoProvider chama o `sair()`
     do AuthProvider (que limpa o token) e só então manda para /login. Tratar
     como link levaria a pessoa para a tela de entrada com a sessão ainda
     aberta, e o RotaProtegida a devolveria para o painel. */
  sair: { caminho: "/login", rotulo: "Sair da conta", existe: true, acao: "sair" },
};

/** `true` quando a tela do destino já está declarada no roteador. */
export function rotaExiste(destino) {
  return ROTAS[destino]?.existe === true;
}

/** `true` quando o destino é uma ação (como sair), e não uma navegação. */
export function acaoDe(destino) {
  return ROTAS[destino]?.acao ?? null;
}

/**
 * Monta o caminho final trocando os `:parametros`.
 *
 *   caminhoDe("prontuario", { pacienteId: "8f3a-..." })
 *   -> "/medico/pacientes/8f3a-..."
 *
 * Um parâmetro que não for informado fica como está no molde, para o
 * problema aparecer na tela em vez de virar uma URL quebrada em silêncio.
 */
export function caminhoDe(destino, parametros = {}) {
  const rota = ROTAS[destino];
  if (!rota) {
    return "";
  }
  return Object.entries(parametros).reduce(
    (caminho, [chave, valor]) => caminho.replace(`:${chave}`, encodeURIComponent(valor)),
    rota.caminho,
  );
}

/**
 * O destino é a página atual (ou uma filha dela)? Marca o item do menu.
 * "inicio" só vale no caminho exato, senão ficaria ativo em toda a área.
 */
export function destinoAtivo(destino, caminhoAtual) {
  const caminho = ROTAS[destino]?.caminho;
  if (!caminho || acaoDe(destino)) return false;
  if (destino === "inicio") return caminhoAtual === caminho || caminhoAtual === `${caminho}/`;
  return caminhoAtual === caminho || caminhoAtual.startsWith(`${caminho}/`);
}

/** Rótulo do destino, para o aviso e para o `aria-label` dos controles. */
export function rotuloDe(destino) {
  return ROTAS[destino]?.rotulo ?? "Em breve";
}
