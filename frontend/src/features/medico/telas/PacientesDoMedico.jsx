import { useCallback, useState } from "react";
import { useSearchParams } from "react-router-dom";

import {
  CampoDaTela,
  CartaoDaTela,
  ConteudoCarregado,
  Paginacao,
} from "../../../components/Telas.jsx";
import estilos from "../../../styles/telas.module.css";
import { dataBr } from "../../../utils/formatos.js";
import { useDadosDaApi } from "../../paciente/useDadosDaApi.js";
import { buscarPacientes } from "../medico.api.js";
import LinkDestino from "../navegacao/LinkDestino.jsx";
import TelaDoMedico from "./TelaDoMedico.jsx";

const POR_PAGINA = 20;

/**
 * Pacientes com consulta com este médico. Também é a tela da busca do
 * cabeçalho (`/medico/busca?q=`): o termo vem da URL e fica nela.
 */
export default function PacientesDoMedico({ titulo = "Pacientes" }) {
  const [parametros, setParametros] = useSearchParams();
  const q = parametros.get("q") ?? "";
  const [pagina, setPagina] = useState(0);
  const carregar = useCallback(
    ({ sinal }) => buscarPacientes({ q: q.trim() || undefined, pagina, tamanho: POR_PAGINA, sinal }),
    [q, pagina],
  );
  const pacientes = useDadosDaApi(carregar);

  return (
    <TelaDoMedico titulo={titulo} subtitulo={q ? `Pacientes com “${q}” no nome.` : "Quem já teve consulta com você."}>
      <CartaoDaTela
        extra={
          <CampoDaTela rotulo="Buscar pelo nome" largo>
            {(props) => (
              <input
                type="search"
                value={q}
                onChange={(e) => {
                  setPagina(0);
                  setParametros(e.target.value ? { q: e.target.value } : {}, { replace: true });
                }}
                {...props}
              />
            )}
          </CampoDaTela>
        }
      >
        <ConteudoCarregado estado={pacientes} carregando="Buscando pacientes…">
          {pacientes.dados?.conteudo.length ? (
            <>
              <ul className={estilos.lista}>
                {pacientes.dados.conteudo.map((p) => (
                  <li key={p.id} className={estilos.item}>
                    <div className={estilos.itemTexto}>
                      <LinkDestino destino="prontuario" parametros={{ pacienteId: p.id }} className={estilos.itemPrincipal}>
                        {p.nome}
                      </LinkDestino>
                      <span className={estilos.itemSecundario}>
                        {p.idade != null ? `${p.idade} anos · ` : ""}
                        {p.motivo}
                      </span>
                    </div>
                    {p.ultimaConsulta && <span className={estilos.itemSecundario}>Última consulta: {dataBr(p.ultimaConsulta)}</span>}
                  </li>
                ))}
              </ul>
              <Paginacao
                pagina={pacientes.dados.pagina}
                totalPaginas={pacientes.dados.totalPaginas}
                totalElementos={pacientes.dados.totalElementos}
                aoMudar={setPagina}
              />
            </>
          ) : (
            <p className={estilos.vazio}>{q ? "Nenhum paciente com esse nome." : "Nenhum paciente ainda."}</p>
          )}
        </ConteudoCarregado>
      </CartaoDaTela>
    </TelaDoMedico>
  );
}
