import { useEffect, useRef } from "react";

import { cx } from "../../../utils/cx.js";
import { TIPOS_NOTIFICACAO, TIPO_PADRAO } from "./tiposNotificacao.js";
import { marcarNotificacaoComoLida, marcarTodasComoLidas } from "../medico.api.js";
import styles from "./MenuNotificacoes.module.css";

const MAXIMO = 5;

/* Marcar como lida é um efeito colateral, não uma condição para fechar:
   sem API (tela em modo de demonstração) a notificação some do mesmo jeito. */
const ignorarErro = () => {};

/**
 * Menu suspenso do sino: as notificações ainda não lidas.
 *
 * Mesmo comportamento do menu da conta: Esc fecha e devolve o foco ao sino,
 * clicar fora fecha. Clicar numa notificação marca como lida; "Marcar todas
 * como lidas" limpa a lista; "Ver todas" leva à tela de notificações.
 *
 * `naoLidas`: lista já filtrada, ou `null` quando a tela não carregou a lista.
 */
export default function MenuNotificacoes({
  id,
  aberto,
  aoFechar,
  botaoDeOrigem,
  naoLidas,
  aoMarcarComoLidas,
  aoVerTodas,
}) {
  const caixa = useRef(null);
  /* Guardado em ref: o pai passa uma função nova a cada render, e ela não
     pode reiniciar o efeito (o foco pularia de volta para o topo). */
  const fechar = useRef(aoFechar);
  useEffect(() => {
    fechar.current = aoFechar;
  });

  useEffect(() => {
    if (!aberto) return undefined;

    caixa.current?.focus();

    const aoTeclar = (evento) => {
      if (evento.key !== "Escape") return;
      fechar.current();
      botaoDeOrigem?.current?.focus();
    };
    const aoClicarFora = (evento) => {
      if (caixa.current?.contains(evento.target)) return;
      if (botaoDeOrigem?.current?.contains(evento.target)) return;
      fechar.current();
    };

    document.addEventListener("keydown", aoTeclar);
    document.addEventListener("mousedown", aoClicarFora);
    return () => {
      document.removeEventListener("keydown", aoTeclar);
      document.removeEventListener("mousedown", aoClicarFora);
    };
  }, [aberto, botaoDeOrigem]);

  if (!aberto) return null;

  const lista = naoLidas ?? [];
  const visiveis = lista.slice(0, MAXIMO);
  const restantes = lista.length - visiveis.length;

  const lerUma = (notificacaoId) => {
    aoMarcarComoLidas([notificacaoId]);
    marcarNotificacaoComoLida(notificacaoId).catch(ignorarErro);
  };

  const lerTodas = () => {
    aoMarcarComoLidas(lista.map(({ id: notificacaoId }) => notificacaoId));
    marcarTodasComoLidas().catch(ignorarErro);
  };

  return (
    <div
      id={id}
      ref={caixa}
      className={styles.menu}
      role="dialog"
      aria-label="Notificações não lidas"
      tabIndex={-1}
    >
      <div className={styles.topo}>
        <span className={styles.titulo}>Notificações</span>
        {lista.length > 0 && (
          <button type="button" className={styles.link} onClick={lerTodas}>
            Marcar todas como lidas
          </button>
        )}
      </div>

      {lista.length === 0 ? (
        <p className={styles.vazio}>Tudo em dia. Nenhuma notificação nova.</p>
      ) : (
        <ul className={styles.lista}>
          {visiveis.map(({ id: notificacaoId, tipo, titulo, detalhe, quando }) => {
            const { icone: Icone, tom, rotulo } = TIPOS_NOTIFICACAO[tipo] ?? TIPO_PADRAO;
            return (
              <li key={notificacaoId}>
                <button
                  type="button"
                  className={styles.item}
                  onClick={() => lerUma(notificacaoId)}
                  title="Marcar como lida"
                >
                  <span className={cx(styles.icone, styles[tom])} aria-hidden="true">
                    <Icone size={tipo === "resultado" ? 12 : 16} />
                  </span>
                  <span className={styles.info}>
                    <span className={styles.itemTitulo}>
                      <span className="sr-only">{rotulo}: </span>
                      {titulo}
                    </span>
                    <span className={styles.detalhe}>{detalhe}</span>
                    <span className={styles.quando}>{quando}</span>
                  </span>
                  <span className={styles.ponto} aria-hidden="true" />
                  <span className="sr-only">. Marcar como lida</span>
                </button>
              </li>
            );
          })}
        </ul>
      )}

      <button type="button" className={styles.rodape} onClick={aoVerTodas}>
        {restantes > 0 ? `Ver todas (mais ${restantes})` : "Ver todas as notificações"}
      </button>
    </div>
  );
}
