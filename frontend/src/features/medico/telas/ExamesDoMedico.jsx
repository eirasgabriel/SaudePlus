import { useCallback, useState } from "react";

import {
  CampoDaTela,
  CartaoDaTela,
  ConteudoCarregado,
  Paginacao,
} from "../../../components/Telas.jsx";
import estilos from "../../../styles/telas.module.css";
import { ROTULO_STATUS_EXAME } from "../../../utils/formatos.js";
import { useDadosDaApi } from "../../paciente/useDadosDaApi.js";
import { listarExames } from "../medico.api.js";
import LinkDestino from "../navegacao/LinkDestino.jsx";
import TelaDoMedico from "./TelaDoMedico.jsx";

const POR_PAGINA = 20;

/** "Exames": tudo o que o médico pediu, mais recentes primeiro. */
export default function ExamesDoMedico() {
  const [status, setStatus] = useState("pendentes");
  const [pagina, setPagina] = useState(0);
  const carregar = useCallback(
    ({ sinal }) => listarExames({ status: status === "todos" ? undefined : status, pagina, tamanho: POR_PAGINA, sinal }),
    [status, pagina],
  );
  const exames = useDadosDaApi(carregar);

  return (
    <TelaDoMedico titulo="Exames" subtitulo="Exames que você pediu e o andamento de cada um.">
      <CartaoDaTela
        titulo="Pedidos"
        extra={
          <CampoDaTela rotulo="Situação" tipo="select">
            {(props) => (
              <select
                value={status}
                onChange={(e) => {
                  setStatus(e.target.value);
                  setPagina(0);
                }}
                {...props}
              >
                <option value="pendentes">Sem resultado</option>
                <option value="todos">Todos</option>
                {Object.entries(ROTULO_STATUS_EXAME).map(([chave, rotulo]) => (
                  <option key={chave} value={chave}>{rotulo}</option>
                ))}
              </select>
            )}
          </CampoDaTela>
        }
      >
        <ConteudoCarregado estado={exames} carregando="Carregando exames…">
          {exames.dados?.conteudo.length ? (
            <>
              <ul className={estilos.lista}>
                {exames.dados.conteudo.map((e) => (
                  <li key={e.id} className={estilos.item}>
                    <div className={estilos.itemTexto}>
                      <LinkDestino destino="exame" parametros={{ exameId: e.id }} className={estilos.itemPrincipal}>
                        {e.nome} · {e.paciente}
                      </LinkDestino>
                      <span className={estilos.itemSecundario}>Prazo: {e.prazo}</span>
                    </div>
                    <span className={estilos.itemSecundario}>{ROTULO_STATUS_EXAME[e.status] ?? e.status}</span>
                  </li>
                ))}
              </ul>
              <Paginacao
                pagina={exames.dados.pagina}
                totalPaginas={exames.dados.totalPaginas}
                totalElementos={exames.dados.totalElementos}
                aoMudar={setPagina}
              />
            </>
          ) : (
            <p className={estilos.vazio}>Nenhum exame nessa situação.</p>
          )}
        </ConteudoCarregado>
      </CartaoDaTela>
    </TelaDoMedico>
  );
}
