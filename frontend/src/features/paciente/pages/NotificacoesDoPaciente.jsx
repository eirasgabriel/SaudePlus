import { CartaoDaTela, ConteudoCarregado } from "../../../components/Telas.jsx";
import { useRetorno } from "../../../components/useRetorno.jsx";
import estilos from "../../../styles/telas.module.css";
import { buscarNotificacoes, marcarNotificacaoComoLida, marcarTodasComoLidas } from "../paciente.api.js";
import { useDadosDaApi } from "../useDadosDaApi.js";
import TelaDoPaciente from "./TelaDoPaciente.jsx";

const carregar = ({ sinal }) => buscarNotificacoes({ sinal });

/** Avisos de consultas e exames, com marcar como lida uma a uma ou todas. */
export default function NotificacoesDoPaciente() {
  const notificacoes = useDadosDaApi(carregar);
  const retorno = useRetorno();
  const naoLidas = notificacoes.dados?.filter((n) => !n.lida).length ?? 0;

  const agir = async (acao) => {
    try {
      await acao();
      notificacoes.recarregar();
    } catch (falha) {
      retorno.erro(falha);
    }
  };

  return (
    <TelaDoPaciente
      titulo="Notificações"
      subtitulo={naoLidas ? `${naoLidas} não lida(s).` : "Avisos sobre suas consultas e exames."}
      acoes={
        naoLidas > 0 && (
          <button type="button" className={estilos.botaoSecundario} onClick={() => agir(() => marcarTodasComoLidas())}>
            Marcar todas como lidas
          </button>
        )
      }
    >
      {retorno.aviso}
      <CartaoDaTela>
        <ConteudoCarregado estado={notificacoes} carregando="Carregando notificações…">
          {notificacoes.dados?.length ? (
            <ul className={estilos.lista}>
              {notificacoes.dados.map((n) => (
                <li key={n.id} className={`${estilos.item} ${n.lida ? "" : estilos.naoLida}`}>
                  <div className={estilos.itemTexto}>
                    <span className={estilos.itemPrincipal}>{n.titulo}</span>
                    {n.detalhe && <span>{n.detalhe}</span>}
                    <span className={estilos.itemSecundario}>{n.quando}</span>
                  </div>
                  {!n.lida && (
                    <button type="button" className={estilos.botaoSecundario} onClick={() => agir(() => marcarNotificacaoComoLida(n.id))}>
                      Marcar como lida
                    </button>
                  )}
                </li>
              ))}
            </ul>
          ) : (
            <p className={estilos.vazio}>Nenhuma notificação.</p>
          )}
        </ConteudoCarregado>
      </CartaoDaTela>
    </TelaDoPaciente>
  );
}
