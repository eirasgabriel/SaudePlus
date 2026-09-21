import { useState } from "react";
import { Link } from "react-router-dom";
import CabecalhoPagina from "../components/CabecalhoPagina";
import CartaoMetrica from "../components/CartaoMetrica";
import Cartao from "../components/Cartao";
import Etiqueta from "../components/Etiqueta";
import Avatar from "../components/Avatar";
import Icone from "../components/Icone";
import GraficoBarras from "../components/GraficoBarras";
import GraficoRosca from "../components/GraficoRosca";
import { Seletor } from "../components/Controles";
import { Tabela, CelulaDupla } from "../components/Tabela";
import {
  metricas,
  agendamentosPorMes,
  periodosGrafico,
  tiposAtendimento,
  acoesRapidas,
  clinicasMaisAcessadas,
  ultimosAgendamentos,
  statusAgendamentoDashboard,
  notificacoes,
} from "../services/dadosAdminDashboard";
import comum from "../styles/adminComum.module.css";
import estilos from "./AdminDashboardPage.module.css";

export default function AdminDashboardPage({ usuario = { nome: "Admin Master" } }) {
  const [periodo, definirPeriodo] = useState("9m");
  const primeiroNome = usuario.nome.split(" ")[0];

  return (
    <>
      <CabecalhoPagina
        titulo={`Olá, ${primeiroNome}!`}
        subtitulo="Aqui está um resumo geral do sistema SaúdePlus."
        data={new Date(2026, 8, 15)}
      />

      <section
        className={`${comum.metricas} ${comum.metricas5}`}
        aria-label="Indicadores gerais"
      >
        {metricas.map((m) => (
          <CartaoMetrica key={m.id} {...m} />
        ))}
      </section>

      {/* ---------- gráficos + ações rápidas ---------- */}
      <div className={estilos.gradeGraficos}>
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

        <div className={estilos.colunaAcoes}>
          <div className={estilos.acoesTopo}>
            <span className={estilos.acoesIcone}>
              <Icone nome="mais" tam={20} espessura={2.3} />
            </span>
            <div>
              <h3 className={estilos.acoesTitulo}>Ações rápidas</h3>
              <p className={estilos.acoesTexto}>
                Acesse as principais funcionalidades do sistema.
              </p>
            </div>
          </div>

          <div className={estilos.acoesGrade}>
            {acoesRapidas.map((acao) => (
              <Link key={acao.id} to={acao.para} className={estilos.acao}>
                <span className={estilos.acaoTopo}>
                  <span className={estilos.acaoIcone}>
                    <Icone nome={acao.icone} tam={18} />
                  </span>
                  <Icone nome="setaDireita" tam={16} className={estilos.acaoSeta} />
                </span>
                <span className={estilos.acaoNome}>{acao.rotulo}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* ---------- listas ---------- */}
      <div className={estilos.gradeListas}>
        <Cartao
          titulo="Clínicas mais acessadas"
          icone="clinica"
          acao={{ rotulo: "Ver todas", href: "/admin/clinicas" }}
          semPadding
        >
          <div className={estilos.tabelaWrap}>
            <Tabela colunas={["#", "Clínica", "Endereço", "Agendamentos (mês)", "Status"]}>
              {clinicasMaisAcessadas.map((c, i) => (
                <tr key={c.id}>
                  <td className={estilos.indice}>{i + 1}</td>
                  <td>
                    <CelulaDupla principal={c.nome} />
                  </td>
                  <td className={estilos.enderecoCelula}>{c.endereco}</td>
                  <td className={estilos.numeroCelula}>
                    {c.agendamentos.toLocaleString("pt-BR")}
                  </td>
                  <td>
                    <Etiqueta variante="sucesso">Ativa</Etiqueta>
                  </td>
                </tr>
              ))}
            </Tabela>
          </div>
        </Cartao>

        <Cartao
          titulo="Últimos agendamentos"
          icone="calendario"
          acao={{ rotulo: "Ver todos", href: "/admin/agendamentos" }}
        >
          <div className={estilos.lista}>
            {ultimosAgendamentos.map((a) => {
              const status = statusAgendamentoDashboard[a.status];
              return (
                <div key={a.id} className={estilos.itemAgendamento}>
                  <Avatar nome={a.paciente} foto={a.foto} tam={38} />
                  <div className={estilos.infoAgendamento}>
                    <div className={estilos.nomeAgendamento}>{a.paciente}</div>
                    <div className={estilos.descAgendamento}>
                      {a.tipo} · {a.medico}
                    </div>
                  </div>
                  <div className={estilos.direitaAgendamento}>
                    <div className={estilos.horaAgendamento}>
                      {a.data} · {a.hora}
                    </div>
                    <Etiqueta variante={status.variante}>{status.rotulo}</Etiqueta>
                  </div>
                </div>
              );
            })}
          </div>
        </Cartao>

        <Cartao
          titulo="Notificações do sistema"
          icone="sino"
          acao={{ rotulo: "Ver todas", href: "#" }}
        >
          <div className={estilos.lista}>
            {notificacoes.map((n) => (
              <div key={n.id} className={estilos.itemNotificacao}>
                <span
                  className={`${estilos.ponto} ${estilos[n.tipo]}`}
                  aria-hidden="true"
                />
                <div className={estilos.infoAgendamento}>
                  <div className={estilos.nomeAgendamento}>{n.titulo}</div>
                  <div className={estilos.descAgendamento}>{n.descricao}</div>
                </div>
                <span className={estilos.tempo}>{n.tempo}</span>
              </div>
            ))}
          </div>
        </Cartao>
      </div>

      {/* ---------- faixa de segurança ---------- */}
      <footer className={estilos.faixa}>
        <span className={estilos.faixaIcone}>
          <Icone nome="escudo" tam={22} />
        </span>
        <div className={estilos.faixaTexto}>
          <strong>Segurança e privacidade em primeiro lugar</strong>
          <p>
            Seus dados estão protegidos com tecnologia de ponta e em conformidade com a
            LGPD.
          </p>
        </div>
        <div className={estilos.faixaMarca}>
          <span className={estilos.faixaNome}>
            <span>Saúde</span>
            <span>Plus</span>
          </span>
          <span className={estilos.faixaSlogan}>Mais saúde para nossa gente.</span>
        </div>
      </footer>
    </>
  );
}
