import { useCallback, useState } from "react";

import {
  CampoDaTela,
  CartaoDaTela,
  ConteudoCarregado,
  Paginacao,
} from "../../../components/Telas.jsx";
import estilos from "../../../styles/telas.module.css";
import { ROTULO_MODALIDADE, dataBr, hojeIso } from "../../../utils/formatos.js";
import { useDadosDaApi } from "../../paciente/useDadosDaApi.js";
import StatusTag from "../components/StatusTag/StatusTag.jsx";
import { STATUS_CONSULTA } from "../data/medico.js";
import { listarConsultas } from "../medico.api.js";
import LinkDestino from "../navegacao/LinkDestino.jsx";
import TelaDoMedico from "./TelaDoMedico.jsx";

const POR_PAGINA = 20;

/** "Consultas": todas as consultas de um período, com filtros e paginação. */
export default function ConsultasDoMedico() {
  const [filtros, setFiltros] = useState(() => ({
    de: hojeIso(-30),
    ate: hojeIso(30),
    status: "todas",
    q: "",
    ordem: "cronologica",
  }));
  const [pagina, setPagina] = useState(0);

  const carregar = useCallback(
    ({ sinal }) =>
      listarConsultas({
        de: filtros.de,
        ate: filtros.ate,
        status: filtros.status === "todas" ? undefined : filtros.status,
        q: filtros.q.trim() || undefined,
        ordem: filtros.ordem === "recentes" ? "recentes" : undefined,
        pagina,
        tamanho: POR_PAGINA,
        sinal,
      }),
    [filtros, pagina],
  );
  const consultas = useDadosDaApi(carregar);

  const filtrar = (campo, valor) => {
    setFiltros((atuais) => ({ ...atuais, [campo]: valor }));
    setPagina(0);
  };

  return (
    <TelaDoMedico titulo="Consultas" subtitulo="Histórico e próximas consultas, por período.">
      <CartaoDaTela>
        <div className={estilos.filtros}>
          <CampoDaTela rotulo="De">
            {(props) => <input type="date" value={filtros.de} onChange={(e) => filtrar("de", e.target.value)} {...props} />}
          </CampoDaTela>
          <CampoDaTela rotulo="Até">
            {(props) => <input type="date" value={filtros.ate} onChange={(e) => filtrar("ate", e.target.value)} {...props} />}
          </CampoDaTela>
          <CampoDaTela rotulo="Status" tipo="select">
            {(props) => (
              <select value={filtros.status} onChange={(e) => filtrar("status", e.target.value)} {...props}>
                <option value="todas">Todos</option>
                {Object.entries(STATUS_CONSULTA).map(([chave, { rotulo }]) => (
                  <option key={chave} value={chave}>{rotulo}</option>
                ))}
              </select>
            )}
          </CampoDaTela>
          <CampoDaTela rotulo="Ordem" tipo="select">
            {(props) => (
              <select value={filtros.ordem} onChange={(e) => filtrar("ordem", e.target.value)} {...props}>
                <option value="cronologica">Mais antigas primeiro</option>
                <option value="recentes">Mais recentes primeiro</option>
              </select>
            )}
          </CampoDaTela>
          <CampoDaTela rotulo="Paciente" largo>
            {(props) => (
              <input type="search" placeholder="Nome do paciente" value={filtros.q} onChange={(e) => filtrar("q", e.target.value)} {...props} />
            )}
          </CampoDaTela>
        </div>
      </CartaoDaTela>

      <CartaoDaTela titulo="Resultado">
        <ConteudoCarregado estado={consultas} carregando="Buscando consultas…">
          {consultas.dados?.conteudo.length ? (
            <>
              <ul className={estilos.lista}>
                {consultas.dados.conteudo.map((c) => (
                  <li key={c.id} className={estilos.item}>
                    <div className={estilos.itemTexto}>
                      <LinkDestino destino="consulta" parametros={{ consultaId: c.id }} className={estilos.itemPrincipal}>
                        {dataBr(c.data)} às {c.horario} · {c.paciente}
                      </LinkDestino>
                      <span className={estilos.itemSecundario}>
                        {c.especialidade} · {c.tipo} · {c.unidade} · {ROTULO_MODALIDADE[c.modalidade] ?? c.modalidade}
                      </span>
                    </div>
                    <StatusTag status={c.status} />
                  </li>
                ))}
              </ul>
              <Paginacao
                pagina={consultas.dados.pagina}
                totalPaginas={consultas.dados.totalPaginas}
                totalElementos={consultas.dados.totalElementos}
                aoMudar={setPagina}
              />
            </>
          ) : (
            <p className={estilos.vazio}>Nenhuma consulta com esses filtros.</p>
          )}
        </ConteudoCarregado>
      </CartaoDaTela>
    </TelaDoMedico>
  );
}
