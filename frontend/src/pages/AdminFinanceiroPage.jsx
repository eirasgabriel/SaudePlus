import { useState } from "react";
import CabecalhoPagina from "../components/CabecalhoPagina";
import CartaoMetrica from "../components/CartaoMetrica";
import Cartao from "../components/Cartao";
import Etiqueta from "../components/Etiqueta";
import ItemLista, { Lista } from "../components/ItemLista";
import GraficoLinha, { LegendaLinha } from "../components/GraficoLinha";
import GraficoRosca from "../components/GraficoRosca";
import { Tabela, CelulaDupla } from "../components/Tabela";
import { Seletor } from "../components/Controles";
import {
  metricas as metricasMock,
  evolucaoFinanceira as evolucaoFinanceiraMock,
  formasPagamento as formasPagamentoMock,
  transacoes as transacoesMock,
  statusTransacao,
  acoesRapidas,
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

/**
 * Dados por prop, com os mocks como padrão. `aoMudarPeriodo("15d")` avisa a
 * troca do período; `aoAcaoRapida(id)` liga as ações rápidas (ex.: "relatorio").
 */
export default function AdminFinanceiroPage({
  metricas = metricasMock,
  evolucaoFinanceira = evolucaoFinanceiraMock,
  formasPagamento = formasPagamentoMock,
  transacoes = transacoesMock,
  aviso = null,
  aoMudarPeriodo,
  aoAcaoRapida,
}) {
  const [periodo, definirPeriodoLocal] = useState("7d");
  const [verTodas, definirVerTodas] = useState(false);
  const [hoje] = useState(() => new Date());
  const rotuloDoPeriodo = (opcoesPeriodoFinanceiro.find((o) => o.valor === periodo)?.rotulo ?? "").toLowerCase();

  function definirPeriodo(valor) {
    definirPeriodoLocal(valor);
    aoMudarPeriodo?.(valor);
  }

  const visiveis = verTodas ? transacoes : transacoes.slice(0, 5);

  return (
    <>
      <CabecalhoPagina
        titulo="Financeiro"
        subtitulo="Acompanhe os valores, pagamentos e movimentações financeiras do sistema."
        icone="banco"
        data={hoje}
      />

      {aviso}

      <section className={comum.metricas} aria-label="Indicadores financeiros">
        {metricas.map((m) => (
          <CartaoMetrica key={m.id} {...m} />
        ))}
      </section>

      {/* ---------- evolução + formas de pagamento ---------- */}
      <div className={comum.gradePrincipal}>
        <Cartao
          titulo="Evolução Financeira"
          subtitulo={`Faturado e recebido nos ${rotuloDoPeriodo}.`}
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
                const status = statusTransacao[t.status] ?? { rotulo: t.status, variante: "neutro" };
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
                aoClicar={() => aoAcaoRapida?.(a.id)}
              />
            ))}
          </Lista>
        </Cartao>
      </div>
    </>
  );
}
