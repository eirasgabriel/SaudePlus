import { useMemo } from "react";
import estilos from "./GraficoBarras.module.css";

const formatar = (n) => n.toLocaleString("pt-BR");

/**
 * Gráfico de barras verticais em CSS puro.
 *
 * A escala é FIXA (`escalaMaxima`), não o maior valor da série — assim a
 * altura da barra corresponde de fato ao rótulo do eixo Y. Se a escala não
 * for informada, é arredondada para cima a partir do maior valor.
 *
 * dados: [{ rotulo: 'Jan', valor: 920 }]
 */
export default function GraficoBarras({
  dados,
  escalaMaxima,
  passo,
  altura = 230,
  formatarValor = formatar,
}) {
  const { topo, marcas } = useMemo(() => {
    const maior = Math.max(...dados.map((d) => d.valor), 0);
    const passoFinal = passo || Math.max(1, Math.ceil(maior / 5 / 100) * 100);
    const topoFinal = escalaMaxima || Math.ceil(maior / passoFinal) * passoFinal;

    const lista = [];
    for (let v = topoFinal; v >= 0; v -= passoFinal) lista.push(v);
    return { topo: topoFinal, marcas: lista };
  }, [dados, escalaMaxima, passo]);

  return (
    <div className={estilos.grafico} style={{ "--altura": `${altura}px` }}>
      <div className={estilos.eixoY} aria-hidden="true">
        {marcas.map((m) => (
          <span key={m}>{formatarValor(m)}</span>
        ))}
      </div>

      <div className={estilos.area}>
        <div className={estilos.grade} aria-hidden="true">
          {marcas.map((m) => (
            <span key={m} />
          ))}
        </div>

        <div
          className={estilos.barras}
          role="img"
          aria-label={dados
            .map((d) => `${d.rotulo}: ${formatarValor(d.valor)}`)
            .join(", ")}
        >
          {dados.map((item, i) => (
            <div
              key={`${item.rotulo}-${i}`}
              className={estilos.barra}
              title={`${item.rotulo} — ${formatarValor(item.valor)}`}
            >
              <div
                className={estilos.preenche}
                style={{ height: `${Math.min(100, (item.valor / topo) * 100)}%` }}
              />
              <span className={estilos.rotulo}>{item.rotulo}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
