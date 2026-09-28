import { useEffect, useMemo, useState } from "react";
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
import { listarAgendamentos } from "../features/agendamentos/agendamentos.api";
import { listarClinicas } from "../features/clinicas/clinicas.api";
import { obterUsuarioLogado } from "../features/auth/auth.api";
import {
  metricas,
  agendamentosPorMes,
  periodosGrafico,
  tiposAtendimento,
  acoesRapidas,
  clinicasMaisAcessadas as clinicasMock,
  ultimosAgendamentos as ultimosMock,
  statusAgendamentoDashboard,
  notificacoes,
} from "../services/dadosAdminDashboard";
import comum from "../styles/adminComum.module.css";
import estilos from "./AdminDashboardPage.module.css";

export default function AdminDashboardPage() {
  const usuario = obterUsuarioLogado() ?? { nome: "Admin Master" };
  const [periodo, definirPeriodo] = useState("9m");
  const [agendamentos, setAgendamentos] = useState([]);
  const [clinicas, setClinicas] = useState(clinicasMock);
  const [carregando, setCarregando] = useState(true);
  const primeiroNome = usuario.nome.split(" ")[0];

  useEffect(() => {
    let ativo = true;

    Promise.allSettled([listarAgendamentos(), listarClinicas()])
      .then(([agendamentosResult, clinicasResult]) => {
        if (!ativo) return;

        const listaAgendamentos = agendamentosResult.status === "fulfilled"
          ? Array.isArray(agendamentosResult.value) ? agendamentosResult.value : []
          : [];

        const listaClinicas = clinicasResult.status === "fulfilled"
          ? Array.isArray(clinicasResult.value) ? clinicasResult.value : []
          : [];

        setAgendamentos(listaAgendamentos);
        setClinicas(
          listaClinicas.length
            ? listaClinicas.map((item, index) => ({
                id: item.id ?? index + 1,
                nome: item.nome ?? "Clínica",
                endereco: `${item.endereco ?? "Endereço não informado"} - ${item.cidade ?? "Saquarema"}`,
                agendamentos: 120 + index * 40,
                status: item.status ?? "ativa",
              }))
            : clinicasMock
        );
      })
      .catch(() => {
        if (ativo) {
          setAgendamentos([]);
          setClinicas(clinicasMock);
        }
      })
      .finally(() => {
        if (ativo) setCarregando(false);
      });

    return () => {
      ativo = false;
    };
  }, []);

  const ultimosAgendamentos = useMemo(() => {
    if (agendamentos.length === 0) return ultimosMock;

    return agendamentos.slice(0, 5).map((item, index) => ({
      id: item.id ?? index + 1,
      paciente: item.paciente ?? "Paciente",
      tipo: item.tipo ?? "Consulta",
      medico: item.medico ?? "Médico",
      data: item.data ?? "15/09",
      hora: item.hora ?? "08:00",
      status: item.status === "pendente" ? "em_atendimento" : item.status ?? "confirmado",
      foto: undefined,
    }));
  }, [agendamentos]);

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
        {carregando && (
          <div style={{ color: "var(--texto-3)", padding: "8px 0" }}>
            Carregando indicadores...
          </div>
        )}
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
              {clinicas.map((c, i) => (
                <tr key={c.id}>
                  <td className={estilos.indice}>{i + 1}</td>
                  <td>
                    <CelulaDupla principal={c.nome} />
                  </td>
                  <td className={estilos.enderecoCelula}>{c.endereco}</td>
                  <td className={estilos.numeroCelula}>
                    {Number(c.agendamentos ?? 0).toLocaleString("pt-BR")}
                  </td>
                  <td>
                    <Etiqueta variante={c.status === "ativa" ? "sucesso" : "info"}>
                      {c.status === "ativa" ? "Ativa" : "Em análise"}
                    </Etiqueta>
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
