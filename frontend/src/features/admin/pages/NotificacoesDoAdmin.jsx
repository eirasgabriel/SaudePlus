import { CabecalhoDaTela, CartaoDaTela, ConteudoCarregado } from "../../../components/Telas.jsx";
import { useRetorno } from "../../../components/useRetorno.jsx";
import estilos from "../../../styles/telas.module.css";
import { useDadosDaApi } from "../../paciente/useDadosDaApi.js";
import * as api from "../admin.api.js";

const carregar = ({ sinal }) => api.listarNotificacoes({ sinal });

/**
 * Notificações de quem está logado (o sino do cabeçalho), no mesmo formato
 * das telas do paciente e do médico. `aoMudar` avisa o layout para reler o
 * contador depois de marcar como lida.
 */
export default function NotificacoesDoAdmin({ aoMudar }) {
  const notificacoes = useDadosDaApi(carregar);
  const retorno = useRetorno();
  const naoLidas = notificacoes.dados?.filter((n) => !n.lida).length ?? 0;

  const agir = async (acao) => {
    try {
      await acao();
      notificacoes.recarregar();
      aoMudar?.();
    } catch (falha) {
      retorno.erro(falha);
    }
  };

  return (
    <>
      <CabecalhoDaTela titulo="Notificações" subtitulo={naoLidas ? `${naoLidas} não lida(s).` : "Tudo em dia."}>
        {naoLidas > 0 && (
          <button type="button" className={estilos.botaoSecundario} onClick={() => agir(() => api.marcarTodasComoLidas())}>
            Marcar todas como lidas
          </button>
        )}
      </CabecalhoDaTela>
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
                    <button
                      type="button"
                      className={estilos.botaoSecundario}
                      onClick={() => agir(() => api.marcarNotificacaoComoLida(n.id))}
                    >
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
    </>
  );
}
