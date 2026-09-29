import { useState } from "react";

import CabecalhoPagina from "../../../components/CabecalhoPagina";
import Cartao from "../../../components/Cartao";
import { Botao } from "../../../components/Controles";
import ItemLista, { Lista } from "../../../components/ItemLista";
import AvisoDeOrigem from "../../medico/components/AvisoDeOrigem/AvisoDeOrigem.jsx";
import { useDadosDaApi } from "../../paciente/useDadosDaApi.js";
import * as api from "../admin.api.js";
import AvisoDoAdmin from "../components/AvisoDoAdmin.jsx";

const carregar = ({ sinal }) => api.listarNotificacoes({ sinal });

/**
 * Notificações de quem está logado (o sino do cabeçalho). `aoMudar` avisa o
 * layout para reler o contador depois de marcar como lida.
 */
export default function NotificacoesDoAdmin({ aoMudar }) {
  const [hoje] = useState(() => new Date());
  const { origem, dados, erro, recarregar } = useDadosDaApi(carregar);
  const [falha, setFalha] = useState(null);
  const naoLidas = dados?.filter((n) => !n.lida).length ?? 0;

  const agir = async (acao) => {
    try {
      await acao();
      setFalha(null);
      recarregar();
      aoMudar?.();
    } catch (motivo) {
      setFalha(motivo.message);
    }
  };

  return (
    <>
      <CabecalhoPagina
        titulo="Notificações"
        subtitulo={naoLidas ? `${naoLidas} não lida(s).` : "Tudo em dia."}
        icone="sino"
        data={hoje}
      />
      <AvisoDeOrigem origem={origem} erro={erro} aoTentarDeNovo={recarregar} />
      {falha && <AvisoDoAdmin tom="erro">{falha}</AvisoDoAdmin>}
      <Cartao
        titulo="Suas notificações"
        icone="sino"
        extra={naoLidas > 0 && <Botao variante="secundario" icone="check" onClick={() => agir(() => api.marcarTodasComoLidas())}>Marcar todas como lidas</Botao>}
      >
        {dados?.length ? (
          <Lista>
            {dados.map((n) => (
              <ItemLista
                key={n.id}
                icone={n.lida ? "sino" : "alerta"}
                titulo={n.titulo}
                descricao={[n.detalhe, n.quando].filter(Boolean).join(" · ")}
                direita={
                  !n.lida && (
                    <Botao variante="secundario" onClick={() => agir(() => api.marcarNotificacaoComoLida(n.id))}>
                      Marcar como lida
                    </Botao>
                  )
                }
              />
            ))}
          </Lista>
        ) : (
          <p>{origem === "carregando" ? "Carregando…" : "Nenhuma notificação."}</p>
        )}
      </Cartao>
    </>
  );
}
