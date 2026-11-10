import Icone from "./Icone";
import estilos from "./CabecalhoPagina.module.css";

/** Data por extenso, como "15 de setembro de 2026". */
function dataPorExtenso(data = new Date()) {
  return data.toLocaleDateString("pt-BR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

/**
 * Cabeçalho padrão das páginas administrativas:
 * ícone + título + subtítulo à esquerda, data (ou outro conteúdo) à direita.
 */
export default function CabecalhoPagina({ titulo, subtitulo, icone, data, direita }) {
  return (
    <header className={estilos.topo}>
      <div>
        <div className={estilos.tituloLinha}>
          {icone && <Icone nome={icone} tam={30} className={estilos.icone} />}
          <h1 className={estilos.titulo}>{titulo}</h1>
        </div>
        {subtitulo && <p className={estilos.subtitulo}>{subtitulo}</p>}
      </div>

      {direita ??
        (data !== false && (
          <span className={estilos.data}>
            <Icone nome="calendario" tam={17} />
            {dataPorExtenso(data)}
          </span>
        ))}
    </header>
  );
}
