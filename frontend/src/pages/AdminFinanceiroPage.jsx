import { useEffect, useState } from "react";
import CabecalhoPagina from "../components/CabecalhoPagina";
import CartaoMetrica from "../components/CartaoMetrica";
import Cartao from "../components/Cartao";
import Etiqueta from "../components/Etiqueta";
import ItemLista, { Lista } from "../components/ItemLista";
import GraficoLinha, { LegendaLinha } from "../components/GraficoLinha";
import GraficoRosca from "../components/GraficoRosca";
import { Tabela, CelulaDupla } from "../components/Tabela";
import { Seletor } from "../components/Controles";
import { listarFinanceiro } from "../features/financeiro/financeiro.api";
import {
  metricas as metricasMock,
  evolucaoFinanceira as evolucaoMock,
  formasPagamento as formasPagamentoMock,
  transacoes as transacoesMock,
  statusTransacao as statusMock,
  acoesRapidas as acoesMock,
  opcoesPeriodoFinanceiro,
} from "../services/dadosAdminFinanceiro";
import comum from "../styles/adminComum.module.css";
import estilos from "./AdminFinanceiroPage.module.css";

const COLUNAS = [
  "Data",
  "Descrição",
  "Paciente / Cliente",
  "Forma de Pagamento",
  "Valor",
  "Status",
];

/** Abrevia os valores do eixo Y: 10000 -> "R$ 10.000" */
const emReais = (n) => `R$ ${n.toLocaleString("pt-BR")}`;

export default function AdminFinanceiroPage() {
  const [periodo, definirPeriodo] = useState("7d");
  const [verTodas, definirVerTodas] = useState(false);
  const [metricas, setMetricas] = useState(metricasMock);
  const [evolucaoFinanceira, setEvolucaoFinanceira] = useState(evolucaoMock);
  const [formasPagamento, setFormasPagamento] = useState(formasPagamentoMock);
  const [transacoes, setTransacoes] = useState(transacoesMock);
  const [statusTransacao, setStatusTransacao] = useState(statusMock);
  const [acoesRapidas, setAcoesRapidas] = useState(acoesMock);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    let ativo = true;

    listarFinanceiro()
      .then((dados) => {
        if (!ativo) return;

        if (dados?.metricas?.length) setMetricas(dados.metricas);
        if (dados?.evolucaoFinanceira) setEvolucaoFinanceira(dados.evolucaoFinanceira);
        if (dados?.formasPagamento) setFormasPagamento(dados.formasPagamento);
        if (dados?.transacoes?.length) setTransacoes(dados.transacoes);
        if (dados?.statusTransacao) setStatusTransacao(dados.statusTransacao);
        if (dados?.acoesRapidas?.length) setAcoesRapidas(dados.acoesRapidas);
      })
      .catch(() => {
        if (ativo) {
          setMetricas(metricasMock);
          setEvolucaoFinanceira(evolucaoMock);
          setFormasPagamento(formasPagamentoMock);
          setTransacoes(transacoesMock);
          setStatusTransacao(statusMock);
          setAcoesRapidas(acoesMock);
        }
      })
      .finally(() => {
        if (ativo) setCarregando(false);
      });

    return () => { ativo = false; };
  }, []);

  const visiveis = verTodas ? transacoes : transacoes.slice(0, 5);

  return (
    <>
      <CabecalhoPagina
        titulo="Financeiro"
        subtitulo="Acompanhe os valores, pagamentos e movimentações financeiras do sistema."
        icone="banco"
        data={new Date(2026, 8, 15)}
      />

      {carregando && (
        <div style={{ marginBottom: 16, color: "var(--texto-3)" }}>Carregando financeiro...</div>
      )}

      <section className={comum.metricas} aria-label="Indicadores financeiros">
        {metricas.map((m) => (
          <CartaoMetrica key={m.id} {...m} />
        ))}
      </section>

      {/* ---------- evolução + formas de pagamento ---------- */}
      <div className={comum.gradePrincipal}>
        <Cartao
          titulo="Evolução Financeira"
          subtitulo="Receitas e pagamentos dos últimos 7 dias."
          icone="tendenciaCima"
          extra={
            <div className={estilos.extraGrafico}>
              <LegendaLinha series={evolucaoFinanceira.series} />
              <Seletor
                valor={periodo}
                aoMudar={definirPeriodo}
                opcoes={opcoesPeriodoFinanceiro}
                className={estilos.seletorPeriodo}
              />
            </div>
          }
        >
          <GraficoLinha
            series={evolucaoFinanceira.series}
            rotulos={evolucaoFinanceira.rotulos}
            escalaMaxima={evolucaoFinanceira.escalaMaxima}
            passo={evolucaoFinanceira.passo}
            altura={240}
            formatarValor={emReais}
          />
        </Cartao>

        <Cartao titulo="Formas de Pagamento" icone="cartao">
          <GraficoRosca
            fatias={formasPagamento.fatias}
            total={formasPagamento.total}
            descricao={formasPagamento.descricao}
            tam={150}
          />
        </Cartao>
      </div>

      {/* ---------- transações + ações rápidas ---------- */}
      <div className={comum.gradePrincipal}>
        <Cartao
          titulo="Últimas Transações"
          icone="documento"
          acao={{
            rotulo: verTodas ? "Ver menos" : "Ver todas as transações",
            aoClicar: () => definirVerTodas((v) => !v),
          }}
          semPadding
        >
          <div className={estilos.tabelaWrap}>
            <Tabela colunas={COLUNAS} vazio="Nenhuma transação no período.">
              {visiveis.map((t) => {
                const status = statusTransacao[t.status];
                return (
                  <tr key={t.id}>
                    <td>{t.dataHora}</td>
                    <td>{t.descricao}</td>
                    <td>
                      <CelulaDupla principal={t.paciente} />
                    </td>
                    <td>{t.forma}</td>
                    <td className={estilos.valor}>{t.valor}</td>
                    <td>
                      <Etiqueta variante={status.variante}>{status.rotulo}</Etiqueta>
                    </td>
                  </tr>
                );
              })}
            </Tabela>
          </div>
        </Cartao>

        <Cartao titulo="Ações Rápidas" icone="raio">
          <Lista>
            {acoesRapidas.map((a) => (
              <ItemLista
                key={a.id}
                icone={a.icone}
                titulo={a.titulo}
                descricao={a.descricao}
                comSeta
                aoClicar={() =>
                  window.alert(`${a.titulo}\n\n${a.descricao}\n\nEssa funcionalidade estará disponível em breve.`)
                }
              />
            ))}
          </Lista>
        </Cartao>
      </div>
    </>
  );
}
