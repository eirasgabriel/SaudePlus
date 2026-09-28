import Icone from "./Icone";
import estilos from "./Cartao.module.css";

/**
 * Cartão base de toda a área administrativa.
 *
 * <Cartao titulo="Clínicas" icone="predio" acao={{ rotulo: 'Ver todas', href: '#' }}>
 *   conteúdo
 * </Cartao>
 *
 * - `extra`  : qualquer nó React no canto direito do cabeçalho (filtros, botões)
 * - `semPadding`: remove o respiro do corpo (para tabelas que vão até a borda)
 */
export default function Cartao({
  titulo,
  subtitulo,
  icone,
  acao,
  extra,
  semPadding = false,
  children,
  className = "",
  ...resto
}) {
  return (
    <section className={`${estilos.cartao} ${className}`} {...resto}>
      {(titulo || extra) && (
        <header className={estilos.topo}>
          {titulo && (
            <div className={estilos.titulo}>
              {icone && (
                <span className={estilos.icone}>
                  <Icone nome={icone} tam={19} />
                </span>
              )}
              <div className={estilos.tituloTexto}>
                <h2>{titulo}</h2>
                {subtitulo && <p className={estilos.subtitulo}>{subtitulo}</p>}
              </div>
            </div>
          )}

          <div className={estilos.extra}>
            {extra}
            {acao &&
              (acao.aoClicar ? (
                <button type="button" className={estilos.acao} onClick={acao.aoClicar}>
                  {acao.rotulo}
                  <Icone nome="setaDireita" tam={14} espessura={2.2} />
                </button>
              ) : (
                <a className={estilos.acao} href={acao.href || "#"}>
                  {acao.rotulo}
                  <Icone nome="setaDireita" tam={14} espessura={2.2} />
                </a>
              ))}
          </div>
        </header>
      )}

      <div className={semPadding ? estilos.corpoSemPadding : estilos.corpo}>
        {children}
      </div>
    </section>
  );
}
