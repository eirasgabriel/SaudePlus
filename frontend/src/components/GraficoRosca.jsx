import { useMemo } from "react";
import estilos from "./GraficoRosca.module.css";

/**
 * Gráfico de rosca em CSS puro, via `conic-gradient`.
 * Os limites das fatias são calculados acumulando os percentuais,
 * então basta alterar `fatias` que o desenho acompanha.
 *
 * fatias: [{ id, rotulo, percentual, cor }]
 */
export default function GraficoRosca({
  fatias,
  total,
  descricao,
  tam = 140,
  className = "",
}) {
  const gradiente = useMemo(() => {
    const { paradas } = fatias.reduce(
      ({ paradas, acumulado }, f) => ({
        paradas: [...paradas, `${f.cor} ${acumulado}% ${acumulado + f.percentual}%`],
        acumulado: acumulado + f.percentual,
      }),
      { paradas: [], acumulado: 0 },
    );
    return `conic-gradient(${paradas.join(", ")})`;
  }, [fatias]);

  const descricaoAcessivel = fatias
    .map((f) => `${f.rotulo} ${f.percentual}%`)
    .join(", ");

  return (
    <div className={`${estilos.wrap} ${className}`}>
      <div
        className={estilos.rosca}
        style={{ background: gradiente, "--tam": `${tam}px` }}
        role="img"
        aria-label={descricaoAcessivel}
      >
        <div className={estilos.centro}>
          <div>
            <div className={estilos.valor}>{total}</div>
            {descricao && <div className={estilos.descricao}>{descricao}</div>}
          </div>
        </div>
      </div>

      <ul className={estilos.legenda}>
        {fatias.map((f) => (
          <li key={f.id} className={estilos.item}>
            <span
              className={estilos.cor}
              style={{ background: f.cor }}
              aria-hidden="true"
            />
            {f.rotulo}
            <span className={estilos.pct}>{f.percentual}%</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
