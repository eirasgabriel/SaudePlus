import { useState } from "react";
import CabecalhoPagina from "../components/CabecalhoPagina";
import CartaoMetrica from "../components/CartaoMetrica";
import Cartao from "../components/Cartao";
import ItemLista, { Lista } from "../components/ItemLista";
import GraficoRosca from "../components/GraficoRosca";
import GraficoBarras from "../components/GraficoBarras";
import BarrasHorizontais from "../components/BarrasHorizontais";
import { Seletor, Botao, Campo } from "../components/Controles";
import Icone from "../components/Icone";
import {
  metricas,
  porEspecialidade,
  evolucaoAtendimentos,
  porFaixaEtaria,
  relatoriosDisponiveis,
  resumoPeriodo,
  opcoesProfissional,
  opcoesUnidade,
  opcoesStatus,
  opcoesEspecialidade,
  opcoesFormato,
  opcoesPeriodo,
} from "../services/dadosAdminRelatorios";
import comum from "../styles/adminComum.module.css";
import estilos from "./AdminRelatoriosPage.module.css";

export default function AdminRelatoriosPage() {
  const [periodo, definirPeriodo] = useState("30d");
  const [filtros, definirFiltros] = useState({
    inicio: "2026-09-15",
    fim: "2026-10-15",
    profissional: "todos",
    unidade: "todas",
    status: "todos",
    especialidade: "todas",
    formato: "pdf",
  });
  const [gerando, definirGerando] = useState(null);

  function atualizar(chave, valor) {
    definirFiltros((atuais) => ({ ...atuais, [chave]: valor }));
  }

  /** Simula a geração — troque pela chamada real à API. */
  function gerar(id) {
    definirGerando(id);
    setTimeout(() => definirGerando(null), 1200);
  }

  return (
    <>
      <CabecalhoPagina
        titulo="Relatórios"
        subtitulo="Acompanhe os dados e gere relatórios do sistema SaúdePlus."
        icone="grafico"
        direita={
          <Seletor
            valor={periodo}
            aoMudar={definirPeriodo}
            opcoes={opcoesPeriodo}
            icone="calendario"
            className={estilos.periodoTopo}
          />
        }
      />

      <section
        className={`${comum.metricas} ${comum.metricas5}`}
        aria-label="Indicadores do período"
      >
        {metricas.map((m) => (
          <CartaoMetrica key={m.id} {...m} />
        ))}
      </section>

      {/* ---------- três gráficos ---------- */}
      <div className={comum.grade3}>
        <Cartao titulo="Atendimentos por especialidade" icone="calendario">
          <GraficoRosca
            fatias={porEspecialidade.fatias}
            total={porEspecialidade.total}
            descricao={porEspecialidade.descricao}
            tam={150}
          />
        </Cartao>

        <Cartao titulo="Evolução de atendimentos" icone="grafico">
          <GraficoBarras
            dados={evolucaoAtendimentos.dados}
            escalaMaxima={evolucaoAtendimentos.escalaMaxima}
            passo={evolucaoAtendimentos.passo}
            altura={210}
          />
        </Cartao>

        <Cartao titulo="Atendimentos por faixa etária" icone="usuarios">
          <BarrasHorizontais dados={porFaixaEtaria} />
        </Cartao>
      </div>

      {/* ---------- relatórios, filtros e resumo ---------- */}
      <div className={comum.grade3}>
        <Cartao titulo="Relatórios disponíveis" icone="grafico">
          <Lista>
            {relatoriosDisponiveis.map((r) => (
              <ItemLista
                key={r.id}
                icone={r.icone}
                titulo={r.titulo}
                descricao={r.descricao}
                comSeta
                direita={
                  <Botao
                    variante="suave"
                    icone={gerando === r.id ? "atualizar" : "baixar"}
                    onClick={() => gerar(r.id)}
                    className={estilos.botaoGerar}
                  >
                    {gerando === r.id ? "Gerando..." : "Gerar"}
                  </Botao>
                }
              />
            ))}
          </Lista>
        </Cartao>

        <Cartao titulo="Filtros avançados" icone="filtro">
          <div className={estilos.gradeFiltros}>
            <Campo
              rotulo="Período — início"
              tipo="date"
              valor={filtros.inicio}
              aoMudar={(v) => atualizar("inicio", v)}
            />
            <Campo
              rotulo="Período — fim"
              tipo="date"
              valor={filtros.fim}
              aoMudar={(v) => atualizar("fim", v)}
            />
            <Seletor
              rotulo="Profissional"
              valor={filtros.profissional}
              aoMudar={(v) => atualizar("profissional", v)}
              opcoes={opcoesProfissional}
            />
            <Seletor
              rotulo="Unidade"
              valor={filtros.unidade}
              aoMudar={(v) => atualizar("unidade", v)}
              opcoes={opcoesUnidade}
            />
            <Seletor
              rotulo="Status do atendimento"
              valor={filtros.status}
              aoMudar={(v) => atualizar("status", v)}
              opcoes={opcoesStatus}
            />
            <Seletor
              rotulo="Especialidade"
              valor={filtros.especialidade}
              aoMudar={(v) => atualizar("especialidade", v)}
              opcoes={opcoesEspecialidade}
            />
            <Seletor
              rotulo="Formato do relatório"
              valor={filtros.formato}
              aoMudar={(v) => atualizar("formato", v)}
              opcoes={opcoesFormato}
              className={estilos.colunaInteira}
            />
          </div>

          <Botao
            icone="baixar"
            blocoTotal
            className={estilos.botaoPersonalizado}
            onClick={() => gerar("personalizado")}
          >
            {gerando === "personalizado"
              ? "Gerando relatório..."
              : "Gerar relatório personalizado"}
          </Botao>
        </Cartao>

        <Cartao titulo="Resumo do período" icone="documento">
          <Lista>
            {resumoPeriodo.map((item) => (
              <ItemLista
                key={item.id}
                icone={item.icone}
                titulo={item.rotulo}
                direita={<strong className={estilos.valorResumo}>{item.valor}</strong>}
              />
            ))}
          </Lista>

          <div className={`${comum.aviso} ${estilos.avisoResumo}`}>
            <Icone nome="info" tam={17} className={comum.avisoIcone} />
            <p className={comum.avisoTexto}>
              Os relatórios são atualizados em tempo real com base nas informações
              do sistema.
            </p>
          </div>
        </Cartao>
      </div>
    </>
  );
}
