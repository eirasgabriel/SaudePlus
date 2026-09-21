import { useMemo, useState } from "react";
import Icone from "./Icone";
import estilos from "./Calendario.module.css";

const DIAS_SEMANA = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"];

/**
 * Calendário mensal com marcadores por tipo de agendamento.
 * A grade é calculada a partir da data (semana começando na segunda),
 * então qualquer mês/ano é renderizado corretamente.
 *
 * marcacoes: { 15: ['consultas','exames'], ... }  (chave = dia do mês)
 * tipos:     [{ id, rotulo, cor }]
 */
export default function Calendario({
  mesInicial = new Date(2026, 8, 1),
  diaSelecionado = 15,
  marcacoes = {},
  tipos = [],
  aoSelecionarDia,
}) {
  const [referencia, definirReferencia] = useState(
    new Date(mesInicial.getFullYear(), mesInicial.getMonth(), 1)
  );
  const [selecionado, definirSelecionado] = useState(diaSelecionado);

  const cores = useMemo(
    () => Object.fromEntries(tipos.map((t) => [t.id, t.cor])),
    [tipos]
  );

  const celulas = useMemo(() => {
    const ano = referencia.getFullYear();
    const mes = referencia.getMonth();

    const primeiro = new Date(ano, mes, 1);
    const diasNoMes = new Date(ano, mes + 1, 0).getDate();
    const diasMesAnterior = new Date(ano, mes, 0).getDate();

    // getDay(): 0=domingo … 6=sábado. Convertido para 0=segunda … 6=domingo.
    const deslocamento = (primeiro.getDay() + 6) % 7;

    const lista = [];

    for (let i = deslocamento; i > 0; i -= 1) {
      lista.push({ dia: diasMesAnterior - i + 1, doMes: false });
    }
    for (let d = 1; d <= diasNoMes; d += 1) {
      lista.push({ dia: d, doMes: true });
    }
    while (lista.length % 7 !== 0) {
      lista.push({ dia: lista.length - deslocamento - diasNoMes + 1, doMes: false });
    }

    return lista;
  }, [referencia]);

  function mudarMes(passo) {
    definirReferencia(
      (atual) => new Date(atual.getFullYear(), atual.getMonth() + passo, 1)
    );
  }

  function selecionar(dia) {
    definirSelecionado(dia);
    aoSelecionarDia?.(dia, referencia);
  }

  const titulo = referencia.toLocaleDateString("pt-BR", {
    month: "long",
    year: "numeric",
  });

  return (
    <div className={estilos.calendario}>
      <div className={estilos.topo}>
        <button
          type="button"
          className={estilos.navBtn}
          onClick={() => mudarMes(-1)}
          aria-label="Mês anterior"
        >
          <Icone nome="chevronEsquerda" tam={17} />
        </button>

        <span className={estilos.mes}>{titulo}</span>

        <button
          type="button"
          className={estilos.navBtn}
          onClick={() => mudarMes(1)}
          aria-label="Próximo mês"
        >
          <Icone nome="chevronDireita" tam={17} />
        </button>
      </div>

      <div className={estilos.grade}>
        {DIAS_SEMANA.map((d) => (
          <span key={d} className={estilos.diaSemana}>
            {d}
          </span>
        ))}

        {celulas.map((celula, i) => {
          const marcas = celula.doMes ? marcacoes[celula.dia] || [] : [];
          const ativo = celula.doMes && celula.dia === selecionado;

          return (
            <button
              key={`${celula.dia}-${i}`}
              type="button"
              className={`${estilos.dia} ${celula.doMes ? "" : estilos.foraDoMes} ${
                ativo ? estilos.selecionado : ""
              }`}
              onClick={() => celula.doMes && selecionar(celula.dia)}
              aria-current={ativo ? "date" : undefined}
            >
              {celula.dia}
              <span className={estilos.marcadores} aria-hidden="true">
                {marcas.slice(0, 3).map((m) => (
                  <span
                    key={m}
                    className={estilos.marcador}
                    style={{ background: cores[m] || "var(--texto-3)" }}
                  />
                ))}
              </span>
            </button>
          );
        })}
      </div>

      {tipos.length > 0 && (
        <div className={estilos.legenda}>
          {tipos.map((t) => (
            <span key={t.id} className={estilos.legendaItem}>
              <span
                className={estilos.legendaCor}
                style={{ background: t.cor }}
                aria-hidden="true"
              />
              {t.rotulo}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
