import { useCallback, useState } from "react";
import { useParams } from "react-router-dom";

import { CartaoDaTela, ConteudoCarregado, Dados } from "../../../components/Telas.jsx";
import { useRetorno } from "../../../components/useRetorno.jsx";
import estilos from "../../../styles/telas.module.css";
import { ROTULO_STATUS_EXAME, dataBr } from "../../../utils/formatos.js";
import { useDadosDaApi } from "../../paciente/useDadosDaApi.js";
import StatusTag from "../components/StatusTag/StatusTag.jsx";
import { buscarPaciente } from "../medico.api.js";
import LinkDestino from "../navegacao/LinkDestino.jsx";
import DialogoPedirExame from "./DialogoPedirExame.jsx";
import TelaDoMedico from "./TelaDoMedico.jsx";

/** Ficha do paciente: dados, consultas e exames com este médico. */
export default function ProntuarioDoMedico() {
  const { pacienteId } = useParams();
  const carregar = useCallback(({ sinal }) => buscarPaciente(pacienteId, { sinal }), [pacienteId]);
  const ficha = useDadosDaApi(carregar);
  const retorno = useRetorno();
  const [pedindoExame, setPedindoExame] = useState(false);
  const p = ficha.dados;

  return (
    <TelaDoMedico
      titulo={p ? p.nome : "Prontuário"}
      subtitulo="Só o que envolve você: consultas e exames que você pediu."
      voltar={{ destino: "pacientes", rotulo: "Pacientes" }}
      acoes={
        p && (
          <button type="button" className={estilos.botao} onClick={() => setPedindoExame(true)}>
            Pedir exame
          </button>
        )
      }
    >
      {retorno.aviso}
      <ConteudoCarregado estado={ficha} carregando="Carregando a ficha…">
        {p && (
          <>
            <CartaoDaTela titulo="Dados do paciente">
              <Dados
                itens={[
                  ["Idade", p.idade != null ? `${p.idade} anos` : null],
                  ["Nascimento", p.dataNascimento ? dataBr(p.dataNascimento) : null],
                  ["Telefone", p.telefone],
                  ["E-mail", p.email],
                ]}
              />
            </CartaoDaTela>

            <CartaoDaTela titulo="Consultas com você">
              {p.historico.length ? (
                <ul className={estilos.lista}>
                  {p.historico.map((c) => (
                    <li key={c.id} className={estilos.item}>
                      <div className={estilos.itemTexto}>
                        <LinkDestino destino="consulta" parametros={{ consultaId: c.id }} className={estilos.itemPrincipal}>
                          {dataBr(c.data)} às {c.horario} · {c.descricao}
                        </LinkDestino>
                        {c.resumo && <span className={estilos.itemSecundario}>{c.resumo}</span>}
                      </div>
                      <StatusTag status={c.status} />
                    </li>
                  ))}
                </ul>
              ) : (
                <p className={estilos.vazio}>Nenhuma consulta.</p>
              )}
            </CartaoDaTela>

            <CartaoDaTela titulo="Exames que você pediu">
              {p.exames.length ? (
                <ul className={estilos.lista}>
                  {p.exames.map((e) => (
                    <li key={e.id} className={estilos.item}>
                      <LinkDestino destino="exame" parametros={{ exameId: e.id }} className={estilos.itemPrincipal}>
                        {e.nome}
                      </LinkDestino>
                      <span className={estilos.itemSecundario}>
                        {ROTULO_STATUS_EXAME[e.status] ?? e.status}
                        {e.prazo ? ` · prazo ${dataBr(e.prazo)}` : ""}
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className={estilos.vazio}>Nenhum exame.</p>
              )}
            </CartaoDaTela>

            <DialogoPedirExame
              aberto={pedindoExame}
              aoFechar={() => setPedindoExame(false)}
              pacienteId={p.id}
              paciente={p.nome}
              aoPedir={(exame) => {
                retorno.sucesso(`${exame.nome} pedido para ${p.nome}.`);
                ficha.recarregar();
              }}
            />
          </>
        )}
      </ConteudoCarregado>
    </TelaDoMedico>
  );
}
