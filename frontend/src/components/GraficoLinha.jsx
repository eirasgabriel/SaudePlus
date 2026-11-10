import { useId, useMemo } from "react";
import estilos from "./GraficoLinha.module.css";

/* Coordenadas internas do SVG. Como usamos preserveAspectRatio="none",
   esses números são só uma malha de referência — o desenho estica junto
   com o container. Por isso os traços levam vector-effect="non-scaling-stroke"
   e os pontos são renderizados em HTML, para não virarem elipses. */
const L = 1000;
const A = 300;

/** Curva suave (Catmull-Rom convertida em Bézier cúbica). */
function caminhoSuave(pontos) {
  if (pontos.length < 2) return "";
  let d = `M ${pontos[0].x} ${pontos[0].y}`;

  for (let i = 0; i < pontos.length - 1; i += 1) {
    const p0 = pontos[i - 1] || pontos[i];
    const p1 = pontos[i];
    const p2 = pontos[i + 1];
    const p3 = pontos[i + 2] || p2;

    const c1x = p1.x + (p2.x - p0.x) / 6;
    const c1y = p1.y + (p2.y - p0.y) / 6;
    const c2x = p2.x - (p3.x - p1.x) / 6;
    const c2y = p2.y - (p3.y - p1.y) / 6;

    d += ` C ${c1x} ${c1y}, ${c2x} ${c2y}, ${p2.x} ${p2.y}`;
  }
  return d;
}

/**
 * Gráfico de linhas com área preenchida, em SVG, sem biblioteca.
 *
 * series:  [{ id, rotulo, cor, valores: number[] }]
 * rotulos: string[]  (eixo X — mesmo comprimento dos valores)
 */
export default function GraficoLinha({
  series,
  rotulos,
  escalaMaxima,
  passo,
  altura = 240,
  formatarValor = (n) => n.toLocaleString("pt-BR"),
}) {
  const idBase = useId();

  const { topo, marcas } = useMemo(() => {
    const maior = Math.max(...series.flatMap((s) => s.valores), 0);
    const passoFinal = passo || Math.max(1, Math.ceil(maior / 5 / 1000) * 1000);
    const topoFinal = escalaMaxima || Math.ceil(maior / passoFinal) * passoFinal;
    const lista = [];
    for (let v = topoFinal; v >= 0; v -= passoFinal) lista.push(v);
    return { topo: topoFinal, marcas: lista };
  }, [series, escalaMaxima, passo]);

  /* Converte cada série em coordenadas do SVG e em posições percentuais
     para os pontos em HTML. */
  const desenhos = useMemo(
    () =>
      series.map((serie) => {
        const n = serie.valores.length;
        const pontos = serie.valores.map((valor, i) => ({
          x: n === 1 ? L / 2 : (i / (n - 1)) * L,
          y: A - Math.min(1, valor / topo) * A,
          valor,
        }));

        const linha = caminhoSuave(pontos);
        const area = `${linha} L ${pontos[n - 1].x} ${A} L ${pontos[0].x} ${A} Z`;

        const pontosHtml = pontos.map((p, i) => ({
          esquerda: `${(p.x / L) * 100}%`,
          topo: `${(p.y / A) * 100}%`,
          valor: p.valor,
          rotulo: rotulos[i],
        }));

        return { ...serie, linha, area, pontosHtml };
      }),
    [series, rotulos, topo]
  );

  const descricao = series
    .map((s) => `${s.rotulo}: ${s.valores.map(formatarValor).join(", ")}`)
    .join(". ");

  return (
    <div className={estilos.grafico} style={{ "--altura": `${altura}px` }}>
      <div className={estilos.eixoY} aria-hidden="true">
        {marcas.map((m) => (
          <span key={m}>{formatarValor(m)}</span>
        ))}
      </div>

      <div className={estilos.area}>
        <div className={estilos.plano}>
          <div className={estilos.grade} aria-hidden="true">
            {marcas.map((m) => (
              <span key={m} />
            ))}
          </div>

          <svg
            className={estilos.svg}
            viewBox={`0 0 ${L} ${A}`}
            preserveAspectRatio="none"
            role="img"
            aria-label={descricao}
          >
            <defs>
              {desenhos.map((s) => (
                <linearGradient
                  key={s.id}
                  id={`${idBase}-${s.id}`}
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop offset="0%" stopColor={s.cor} stopOpacity="0.26" />
                  <stop offset="100%" stopColor={s.cor} stopOpacity="0.02" />
                </linearGradient>
              ))}
            </defs>

            {desenhos.map((s) => (
              <path key={`a-${s.id}`} d={s.area} fill={`url(#${idBase}-${s.id})`} />
            ))}

            {desenhos.map((s) => (
              <path
                key={`l-${s.id}`}
                d={s.linha}
                fill="none"
                stroke={s.cor}
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                vectorEffect="non-scaling-stroke"
              />
            ))}
          </svg>

          <div className={estilos.pontos} aria-hidden="true">
            {desenhos.map((s) =>
              s.pontosHtml.map((p, i) => (
                <span
                  key={`${s.id}-${i}`}
                  className={estilos.ponto}
                  style={{ left: p.esquerda, top: p.topo, background: s.cor }}
                  title={`${p.rotulo} · ${s.rotulo}: ${formatarValor(p.valor)}`}
                />
              ))
            )}
          </div>
        </div>

        <div className={estilos.rotulosX} aria-hidden="true">
          {rotulos.map((r) => (
            <span key={r} className={estilos.rotuloX}>
              {r}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

/** Legenda do gráfico — passe como `extra` do Cartao. */
export function LegendaLinha({ series }) {
  return (
    <div className={estilos.legenda}>
      {series.map((s) => (
        <span key={s.id} className={estilos.legendaItem}>
          <span
            className={estilos.legendaCor}
            style={{ background: s.cor }}
            aria-hidden="true"
          />
          {s.rotulo}
        </span>
      ))}
    </div>
  );
}
