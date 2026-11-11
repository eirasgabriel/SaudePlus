import { useId, useState } from "react";
import { Link } from "react-router-dom";
import Cartao from "../components/Cartao";
import Etiqueta from "../components/Etiqueta";
import Avatar from "../components/Avatar";
import Icone from "../components/Icone";
import GraficoBarras from "../components/GraficoBarras";
import GraficoRosca from "../components/GraficoRosca";
import { Seletor } from "../components/Controles";
import WelcomeBanner from "../features/medico/components/WelcomeBanner/WelcomeBanner.jsx";
import {
  metricas as metricasMock,
  agendamentosPorMes as agendamentosPorMesMock,
  periodosGrafico,
  tiposAtendimento as tiposAtendimentoMock,
  acoesRapidas,
  clinicasMaisAcessadas as clinicasMaisAcessadasMock,
  ultimosAgendamentos as ultimosAgendamentosMock,
  statusAgendamentoDashboard,
  notificacoes as notificacoesMock,
} from "../services/dadosAdminDashboard";
import estilos from "./AdminDashboardPage.module.css";

const setas = { sobe: "▲", desce: "▼", alerta: "⚠", neutra: "" };
const formatoData = new Intl.DateTimeFormat("pt-BR", { day: "numeric", month: "long", year: "numeric" });

/**
 * Dashboard da equipe, no mesmo desenho do painel do médico: faixa de
 * boas-vindas, cartões de resumo, painéis em dupla e a coluna direita com a
 * peça marinho (Ações rápidas) e as notificações.
 *
 * Dados por prop, com os mocks como padrão. `aoMudarPeriodo("6m")` avisa a
 * troca do período do gráfico, para quem busca a série na API.
 */
export default function AdminDashboardPage({
  usuario = { nome: "Admin Master" },
  metricas = metricasMock,
  agendamentosPorMes = agendamentosPorMesMock,
  tiposAtendimento = tiposAtendimentoMock,
  clinicasMaisAcessadas = clinicasMaisAcessadasMock,
  ultimosAgendamentos = ultimosAgendamentosMock,
  notificacoes = notificacoesMock,
  aviso = null,
  aoMudarPeriodo,
}) {
  const [periodo, definirPeriodoLocal] = useState("9m");
  const [hoje] = useState(() => new Date());
  const prefixo = `ad-${useId().replace(/[^a-zA-Z0-9_-]/g, "")}`;
  const ids = {
    boasVindas: `${prefixo}-boas-vindas`,
    resumo: `${prefixo}-resumo`,
    acoes: `${prefixo}-acoes`,
  };

  function definirPeriodo(valor) {
    definirPeriodoLocal(valor);
    aoMudarPeriodo?.(valor);
  }
  const primeiroNome = usuario.nome.split(" ")[0];

  return (
    <div className={estilos.grade}>
      <div className={estilos.conteudo}>
        <WelcomeBanner
          nome={primeiroNome}
          subtitulo="Aqui está um resumo geral do sistema SaúdePlus."
          imagem={null}
          tituloId={ids.boasVindas}
        />

        {aviso}

        <section className={estilos.resumo} aria-labelledby={ids.resumo}>
          <h2 id={ids.resumo} className="sr-only">
            Indicadores gerais
          </h2>
          {metricas.map((m) => (
            <article key={m.id} className={estilos.metrica}>
              <span className={estilos.metricaIcone} aria-hidden="true">
                <Icone nome={m.icone} tam={22} />
              </span>
              <h3 className={estilos.metricaRotulo}>{m.rotulo}</h3>
              <p className={`${estilos.metricaValor} ${m.tom === "vermelho" ? estilos.perigo : ""}`}>
                {m.valor}
              </p>
              {m.nota && <p className={estilos.metricaApoio}>{m.nota}</p>}
              {m.variacao && (
                <p className={`${estilos.metricaVariacao} ${estilos[m.variacao.tendencia] ?? ""}`}>
                  {setas[m.variacao.tendencia]} {m.variacao.valor}
                </p>
              )}
            </article>
          ))}
        </section>

        <div className={estilos.dupla}>
          <Cartao
            titulo="Agendamentos por mês"
            icone="calendario"
            extra={
              <Seletor
                valor={periodo}
                aoMudar={definirPeriodo}
                opcoes={periodosGrafico}
                className={estilos.seletorPeriodo}
              />
            }
          >
            <GraficoBarras
              dados={agendamentosPorMes.dados}
              escalaMaxima={agendamentosPorMes.escalaMaxima}
              passo={agendamentosPorMes.passo}
            />
          </Cartao>

          <Cartao titulo="Por tipo de atendimento" icone="estrela">
            <GraficoRosca
              fatias={tiposAtendimento.fatias}
              total={tiposAtendimento.total}
              descricao={tiposAtendimento.descricao}
            />
          </Cartao>
        </div>

        <div className={estilos.dupla}>
          <Cartao
            titulo="Últimos agendamentos"
            icone="calendario"
            acao={{ rotulo: "Ver todos", href: "/admin/agendamentos" }}
          >
            <ul className={estilos.lista}>
              {ultimosAgendamentos.map((a) => {
                const status = statusAgendamentoDashboard[a.status] ?? { rotulo: a.status, variante: "neutro" };
                return (
                  <li key={a.id} className={estilos.item}>
                    <Avatar nome={a.paciente} foto={a.foto} tam={38} />
                    <div className={estilos.itemInfo}>
                      <div className={estilos.itemNome}>{a.paciente}</div>
                      <div className={estilos.itemDesc}>
                        {a.tipo} · {a.medico}
                      </div>
                    </div>
                    <div className={estilos.itemDireita}>
                      <div className={estilos.itemHora}>
                        {a.data} · {a.hora}
                      </div>
                      <Etiqueta variante={status.variante} status={a.status}>
                        {status.rotulo}
                      </Etiqueta>
                    </div>
                  </li>
                );
              })}
            </ul>
          </Cartao>

          <Cartao
            titulo="Clínicas mais acessadas"
            icone="clinica"
            acao={{ rotulo: "Ver todas", href: "/admin/clinicas" }}
          >
            <ol className={estilos.lista}>
              {clinicasMaisAcessadas.map((c, i) => (
                <li key={c.id} className={estilos.item}>
                  <span className={estilos.indice} aria-hidden="true">
                    {i + 1}
                  </span>
                  <div className={estilos.itemInfo}>
                    <div className={estilos.itemNome}>{c.nome}</div>
                    <div className={estilos.itemDesc}>{c.endereco}</div>
                  </div>
                  <div className={estilos.itemNumero}>
                    {c.agendamentos.toLocaleString("pt-BR")}
                    <span className={estilos.itemNumeroRotulo}>no mês</span>
                  </div>
                </li>
              ))}
            </ol>
          </Cartao>
        </div>
      </div>

      <div className={estilos.trilha}>
        {/* A peça marinho da tela, como a "Agenda do dia" do médico. */}
        <section className={estilos.acoes} aria-labelledby={ids.acoes}>
          <div className={estilos.acoesCabecalho}>
            <span className={estilos.acoesIcone} aria-hidden="true">
              <Icone nome="mais" tam={20} espessura={2.3} />
            </span>
            <h2 id={ids.acoes} className={estilos.acoesTitulo}>
              Ações rápidas
            </h2>
            <p className={estilos.acoesData}>{formatoData.format(hoje)}</p>
          </div>

          <ul className={estilos.acoesLista}>
            {acoesRapidas.map((acao) => (
              <li key={acao.id}>
                <Link to={acao.para} className={estilos.acao}>
                  <Icone nome={acao.icone} tam={18} className={estilos.acaoIcone} />
                  <span className={estilos.acaoNome}>{acao.rotulo}</span>
                  <Icone nome="setaDireita" tam={16} className={estilos.acaoSeta} />
                </Link>
              </li>
            ))}
          </ul>
        </section>

        <Cartao
          titulo="Notificações do sistema"
          icone="sino"
          acao={{ rotulo: "Ver todas", href: "/admin/notificacoes" }}
        >
          <ul className={estilos.lista}>
            {notificacoes.map((n) => (
              <li key={n.id} className={estilos.item}>
                <span className={`${estilos.ponto} ${estilos[n.tipo] ?? ""}`} aria-hidden="true" />
                <div className={estilos.itemInfo}>
                  <div className={estilos.itemNome}>{n.titulo}</div>
                  <div className={estilos.itemDesc}>{n.descricao}</div>
                  <div className={estilos.tempo}>{n.tempo}</div>
                </div>
              </li>
            ))}
          </ul>
        </Cartao>
      </div>
    </div>
  );
}
