import estilos from "./BarrasHorizontais.module.css";

/**
 * Barras horizontais para distribuições (ex.: atendimentos por faixa etária).
 * dados: [{ rotulo, percentual }]
 *
 * A largura da barra é o percentual relativo ao maior item, para que a
 * maior faixa ocupe a linha inteira e as demais fiquem comparáveis.
 */
export default function BarrasHorizontais({ dados, larguraRotulo = 96 }) {
  const maior = Math.max(...dados.map((d) => d.percentual), 1);

  return (
    <div className={estilos.lista}>
      {dados.map((item) => (
        <div
          key={item.rotulo}
          className={estilos.item}
          style={{ "--rotulo-w": `${larguraRotulo}px` }}
        >
          <span className={estilos.rotulo}>{item.rotulo}</span>
          <div
            className={estilos.trilho}
            role="img"
            aria-label={`${item.rotulo}: ${item.percentual}%`}
          >
            <div
              className={estilos.preenche}
              style={{ width: `${(item.percentual / maior) * 100}%` }}
            />
          </div>
          <span className={estilos.valor}>{item.percentual}%</span>
        </div>
      ))}
    </div>
  );
}
