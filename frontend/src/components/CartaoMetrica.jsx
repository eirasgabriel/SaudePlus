import Icone from "./Icone";
import estilos from "./CartaoMetrica.module.css";

const setas = { sobe: "▲", desce: "▼", alerta: "⚠", neutra: "" };

/**
 * Cartão de indicador usado no topo de quase todas as telas.
 *
 * <CartaoMetrica
 *   rotulo="Receita Total" valor="R$ 48.750,00" icone="carteira"
 *   variacao={{ valor:'12% em relação ao mês anterior', tendencia:'sobe' }}
 * />
 *
 * `tom`: azul (padrão) | verde | vermelho | amarelo
 */
export default function CartaoMetrica({
  rotulo,
  valor,
  icone,
  nota,
  variacao,
  tom = "azul",
  className = "",
}) {
  return (
    <article className={`${estilos.metrica} ${estilos[tom]} ${className}`}>
      <span className={estilos.icone}>
        <Icone nome={icone} tam={25} />
      </span>

      <div className={estilos.info}>
        <div className={estilos.rotulo}>{rotulo}</div>
        <div className={estilos.valor}>{valor}</div>
        {nota && <div className={estilos.nota}>{nota}</div>}
        {variacao && (
          <div className={`${estilos.variacao} ${estilos[variacao.tendencia]}`}>
            {setas[variacao.tendencia]} {variacao.valor}
          </div>
        )}
      </div>
    </article>
  );
}
