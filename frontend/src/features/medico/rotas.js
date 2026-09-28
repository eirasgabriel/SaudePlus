/* ============================================================================
   MAPA DE ROTAS DO PAINEL DO MÉDICO
   ============================================================================

   Este arquivo é o único lugar que conhece os endereços das telas do médico.
   Nenhum componente escreve caminho na mão: todos pedem um destino pelo nome
   (`irPara("agenda")`) e quem resolve é o NavegacaoContext.

   Hoje NENHUMA dessas telas existe. Enquanto `ROTAS_ATIVAS` for `false`,
   clicar em qualquer destino abre um aviso de "em breve" mostrando para onde
   o botão vai levar. Nada fica morto e nada mente para quem usa.

   ---------------------------------------------------------------------------
   COMO ATIVAR AS ROTAS (quando o React Router cobrir a área logada)
   ---------------------------------------------------------------------------

   1. Em `src/app/App.jsx`, declare a área do médico como layout route:

        <Route path="medico" element={<DashboardLayout />}>
          <Route index element={<VisaoGeral />} />
          <Route path="agenda" element={<Agenda />} />
          <Route path="consultas/:consultaId" element={<DetalheConsulta />} />
          ...
        </Route>

      Os caminhos abaixo já estão escritos nesse formato — é só copiar.

   2. Aqui neste arquivo, troque `ROTAS_ATIVAS` para `true`.

   3. Em `navegacao/NavegacaoProvider.jsx`, descomente as duas linhas
      marcadas com "ATIVAR ROTAS" (o import do `useNavigate` e a chamada
      `navigate(...)`), e acrescente `navigate` às dependências do useCallback.

   4. Em `navegacao/LinkDestino.jsx`, troque o corpo por uma linha:

        return <NavLink to={caminhoDe(destino, parametros)} {...resto}>{children}</NavLink>

      Esse é o único arquivo a mexer: todo link do painel passa por ele, já
      com o caminho certo no href. Em seguida remova o campo `ativo` de
      `layouts/navigation.js` — quem marca a página atual passa a ser o
      `isActive` do NavLink.

   5. Apague `medico.html` e `src/medico.jsx`: a entrada separada só existe
      porque ainda não há rota para o painel.

   Fazendo isso, todos os botões desta tela passam a navegar sem que nenhum
   componente precise ser reescrito.
   ========================================================================= */

/** Vire para `true` no passo 2 acima. */
export const ROTAS_ATIVAS = false;

/**
 * Destinos do painel.
 *
 * `caminho` usa a sintaxe do React Router (`:parametro`).
 * `rotulo` é o que aparece no aviso e no título da tela.
 */
export const ROTAS = {
  inicio: { caminho: "/medico", rotulo: "Início" },
  agenda: { caminho: "/medico/agenda", rotulo: "Minha agenda" },
  consultas: { caminho: "/medico/consultas", rotulo: "Consultas" },
  consulta: { caminho: "/medico/consultas/:consultaId", rotulo: "Detalhe da consulta" },
  exames: { caminho: "/medico/exames", rotulo: "Exames" },
  exame: { caminho: "/medico/exames/:exameId", rotulo: "Detalhe do exame" },
  pacientes: { caminho: "/medico/pacientes", rotulo: "Pacientes" },
  prontuario: { caminho: "/medico/pacientes/:pacienteId", rotulo: "Prontuário do paciente" },
  unidade: { caminho: "/medico/unidade", rotulo: "Unidade" },
  notificacoes: { caminho: "/medico/notificacoes", rotulo: "Notificações" },
  conta: { caminho: "/medico/conta", rotulo: "Minha conta" },
  configuracoes: { caminho: "/medico/configuracoes", rotulo: "Configurações" },
  busca: { caminho: "/medico/busca", rotulo: "Busca" },

  /* Fora da área do médico. A página de Ajuda já existe no site
     institucional (branch feature/homepage), então este é o único destino
     desta tela que vai funcionar assim que as duas áreas estiverem no mesmo
     roteador — não precisa de tela nova. */
  ajuda: { caminho: "/ajuda", rotulo: "Ajuda" },

  /* A sessão ainda não existe, então "sair" também fica reservado. Quando a
     autenticação entrar, este destino deixa de ser uma rota e vira uma ação:
     limpar o token e só então mandar para /entrar. */
  sair: { caminho: "/entrar", rotulo: "Sair da conta" },
};

/**
 * Monta o caminho final trocando os `:parametros`.
 *
 *   caminhoDe("prontuario", { pacienteId: "ana-paula-ferreira" })
 *   -> "/medico/pacientes/ana-paula-ferreira"
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

/** Rótulo do destino, para o aviso e para o `aria-label` dos controles. */
export function rotuloDe(destino) {
  return ROTAS[destino]?.rotulo ?? "Em breve";
}
