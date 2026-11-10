import Icone from "./Icone";
import estilos from "./ItemLista.module.css";

/** Container dos itens. */
export function Lista({ children, className = "" }) {
  return <div className={`${estilos.lista} ${className}`}>{children}</div>;
}

/**
 * Linha padrão de configuração / atalho:
 *   [ícone] Título + descrição ......... [controle] [›]
 *
 * - `direita` : qualquer nó (Interruptor, Etiqueta, Botao...)
 * - `comSeta` : mostra o chevron à direita
 * - `aoClicar`: transforma a linha inteira num <button>
 * - `tom`     : azul (padrão) | verde | vermelho | amarelo | roxo | neutro
 */
export default function ItemLista({
  icone,
  imagem,
  titulo,
  descricao,
  direita,
  comSeta = false,
  aoClicar,
  tom = "azul",
  className = "",
}) {
  const Elemento = aoClicar ? "button" : "div";

  return (
    <Elemento
      className={`${estilos.item} ${aoClicar ? estilos.clicavel : ""} ${className}`}
      onClick={aoClicar}
      {...(aoClicar ? { type: "button" } : {})}
    >
      {(icone || imagem) && (
        <span className={`${estilos.icone} ${tom !== "azul" ? estilos[tom] : ""}`}>
          {imagem ? (
            <img src={imagem} alt="" className="spImagem" style={{ objectFit: "contain" }} />
          ) : (
            <Icone nome={icone} tam={20} />
          )}
        </span>
      )}

      <span className={estilos.texto}>
        <span className={estilos.titulo}>{titulo}</span>
        {descricao && <span className={estilos.descricao}>{descricao}</span>}
      </span>

      {(direita || comSeta) && (
        <span className={estilos.direita}>
          {direita}
          {comSeta && <Icone nome="chevronDireita" tam={17} className={estilos.seta} />}
        </span>
      )}
    </Elemento>
  );
}
