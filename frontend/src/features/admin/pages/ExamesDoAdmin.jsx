import { useCallback, useState } from "react";

import CabecalhoPagina from "../../../components/CabecalhoPagina";
import Cartao from "../../../components/Cartao";
import { Seletor } from "../../../components/Controles";
import Dialogo from "../../../components/Dialogo.jsx";
import DialogoConfirmacao from "../../../components/DialogoConfirmacao.jsx";
import dlg from "../../../components/ModalAgendamento.module.css";
import Etiqueta from "../../../components/Etiqueta";
import { AcoesLinha, CelulaDupla, Tabela } from "../../../components/Tabela";
import { ROTULO_STATUS_EXAME, dataBr, dataHoraBr } from "../../../utils/formatos.js";
import AvisoDeOrigem from "../../medico/components/AvisoDeOrigem/AvisoDeOrigem.jsx";
import { useDadosDaApi } from "../../paciente/useDadosDaApi.js";
import * as api from "../admin.api.js";
import AvisoDoAdmin from "../components/AvisoDoAdmin.jsx";
import * as exames from "../exames.api.js";

const COLUNAS = ["Exame", "Paciente", "Pedido por", "Situação", "Coleta", "Prazo", "Ações"];

const VARIANTE = { solicitado: "info", agendado: "roxo", em_analise: "aviso", liberado: "sucesso", cancelado: "erro" };

const FILTROS = [
  { valor: "", rotulo: "Todos" },
  ...Object.entries(ROTULO_STATUS_EXAME).map(([valor, rotulo]) => ({ valor, rotulo })),
];

/** Fila de exames da clínica: agendar a coleta, pôr em análise, enviar o resultado ou cancelar. */
export default function ExamesDoAdmin() {
  const [hoje] = useState(() => new Date());
  const [status, setStatus] = useState("");
  const carregar = useCallback(
    async ({ sinal }) => {
      const [fila, unidades] = await Promise.all([
        exames.listarExames({ status: status || undefined, sinal }),
        // Sem o módulo "clinicas" a lista de unidades é recusada; a coleta fica sem opções.
        api.listarUnidades({ sinal }).catch(() => []),
      ]);
      return { fila, unidades: unidades.filter((u) => u.status === "ativa") };
    },
    [status],
  );
  const { origem, dados, erro, recarregar } = useDadosDaApi(carregar);
  const [retorno, setRetorno] = useState(null);
  const [agendando, setAgendando] = useState(null);
  const [enviandoResultado, setEnviandoResultado] = useState(null);
  const [cancelando, setCancelando] = useState(null);

  const agir = async (acao, texto) => {
    try {
      await acao();
      setRetorno({ tom: "sucesso", texto });
      recarregar();
    } catch (falha) {
      setRetorno({ tom: "erro", texto: falha.message });
    }
  };

  const acoesDe = (e) => {
    const antesDaAnalise = e.status === "solicitado" || e.status === "agendado";
    return [
      ...(antesDaAnalise
        ? [
            { icone: "calendario", rotulo: "Agendar coleta", aoClicar: () => setAgendando(e) },
            {
              icone: "frasco",
              rotulo: "Pôr em análise",
              aoClicar: () => agir(() => exames.iniciarAnalise(e.id), `${e.nome} de ${e.paciente} em análise.`),
            },
          ]
        : []),
      ...(e.status !== "cancelado"
        ? [{ icone: "upload", rotulo: e.status === "liberado" ? "Substituir resultado" : "Enviar resultado", aoClicar: () => setEnviandoResultado(e) }]
        : []),
      ...(e.status !== "liberado" && e.status !== "cancelado"
        ? [{ icone: "lixeira", rotulo: "Cancelar exame", tom: "perigo", aoClicar: () => setCancelando(e) }]
        : []),
    ];
  };

  return (
    <>
      <CabecalhoPagina titulo="Exames" subtitulo="Fila de exames pedidos pelos médicos da rede." icone="frasco" data={hoje} />
      <AvisoDeOrigem origem={origem} erro={erro} aoTentarDeNovo={recarregar} />
      {retorno && <AvisoDoAdmin tom={retorno.tom}>{retorno.texto}</AvisoDoAdmin>}

      <Cartao
        titulo="Pedidos"
        icone="frasco"
        extra={<Seletor rotulo="Situação" valor={status} aoMudar={setStatus} opcoes={FILTROS} />}
        semPadding
      >
        <div style={{ padding: "0 12px 12px" }}>
          <Tabela colunas={COLUNAS} vazio={origem === "carregando" ? "Carregando…" : "Nenhum exame nessa situação."}>
            {(dados?.fila ?? []).map((e) => (
              <tr key={e.id}>
                <td><CelulaDupla principal={e.nome} secundario={e.categoria} /></td>
                <td>{e.paciente}</td>
                <td>{e.medico ?? "—"}</td>
                <td><Etiqueta variante={VARIANTE[e.status]} comPonto>{ROTULO_STATUS_EXAME[e.status] ?? e.status}</Etiqueta></td>
                <td>{e.dataHora ? <CelulaDupla principal={dataHoraBr(e.dataHora)} secundario={e.unidade} /> : "—"}</td>
                <td>{e.prazo ? dataBr(e.prazo) : "—"}</td>
                <td><AcoesLinha acoes={acoesDe(e)} /></td>
              </tr>
            ))}
          </Tabela>
        </div>
      </Cartao>

      <DialogoAgendarColeta
        exame={agendando}
        unidades={dados?.unidades ?? []}
        aoFechar={() => setAgendando(null)}
        aoAgendar={async (corpo) => {
          await exames.agendarColeta(agendando.id, corpo);
          setRetorno({ tom: "sucesso", texto: `Coleta de ${agendando.nome} marcada; ${agendando.paciente} foi avisado(a).` });
          recarregar();
        }}
      />

      <DialogoResultado
        key={enviandoResultado?.id ?? "fechado"}
        exame={enviandoResultado}
        aoFechar={() => setEnviandoResultado(null)}
        aoEnviar={async (arquivo) => {
          await exames.enviarResultado(enviandoResultado.id, arquivo);
          setRetorno({ tom: "sucesso", texto: `Resultado de ${enviandoResultado.nome} liberado para ${enviandoResultado.paciente}.` });
          recarregar();
        }}
      />

      <DialogoConfirmacao
        aberto={Boolean(cancelando)}
        aoFechar={() => setCancelando(null)}
        titulo="Cancelar exame"
        mensagem={cancelando ? `Cancelar ${cancelando.nome} de ${cancelando.paciente}? O paciente é avisado.` : ""}
        rotuloConfirmar="Cancelar exame"
        aoConfirmar={async () => {
          await exames.cancelarExame(cancelando.id);
          setRetorno({ tom: "sucesso", texto: `${cancelando.nome} de ${cancelando.paciente} cancelado.` });
          recarregar();
        }}
      />
    </>
  );
}

function DialogoAgendarColeta({ exame, unidades, aoFechar, aoAgendar }) {
  return (
    <Dialogo aberto={Boolean(exame)} aoFechar={aoFechar} titulo="Agendar coleta"
      descricao={exame ? `${exame.nome} · ${exame.paciente}` : undefined}>
      {exame && <FormularioColeta key={exame.id} exame={exame} unidades={unidades} aoFechar={aoFechar} aoAgendar={aoAgendar} />}
    </Dialogo>
  );
}

function FormularioColeta({ exame, unidades, aoFechar, aoAgendar }) {
  const [dataHora, setDataHora] = useState(exame.dataHora?.slice(0, 16) ?? "");
  const [unidadeId, setUnidadeId] = useState("");
  const [erro, setErro] = useState(null);
  const [enviando, setEnviando] = useState(false);

  const enviar = async (evento) => {
    evento.preventDefault();
    if (!dataHora || !unidadeId) {
      setErro("Informe o dia, a hora e a unidade.");
      return;
    }
    setEnviando(true);
    setErro(null);
    try {
      await aoAgendar({ dataHora, unidadeId });
      aoFechar();
    } catch (falha) {
      setErro(falha.message);
    } finally {
      setEnviando(false);
    }
  };

  return (
    <form className={dlg.formulario} onSubmit={enviar} noValidate>
      <div className={dlg.campo}>
        <label className={dlg.rotulo} htmlFor="coleta-quando">Dia e hora</label>
        <input id="coleta-quando" type="datetime-local" className={dlg.input} value={dataHora} onChange={(e) => setDataHora(e.target.value)} />
      </div>
      <div className={dlg.campo}>
        <label className={dlg.rotulo} htmlFor="coleta-unidade">Unidade</label>
        <select id="coleta-unidade" className={dlg.select} value={unidadeId} onChange={(e) => setUnidadeId(e.target.value)}>
          <option value="">{unidades.length ? "Selecione a unidade" : "Nenhuma unidade disponível"}</option>
          {unidades.map((u) => <option key={u.id} value={u.id}>{u.nome}</option>)}
        </select>
      </div>
      {erro && <p className={dlg.erro} role="alert">{erro}</p>}
      <div className={dlg.acoes}>
        <button type="button" className={dlg.botaoSecundario} onClick={aoFechar}>Cancelar</button>
        <button type="submit" className={dlg.botaoPrimario} disabled={enviando}>{enviando ? "Salvando…" : "Agendar"}</button>
      </div>
    </form>
  );
}

function DialogoResultado({ exame, aoFechar, aoEnviar }) {
  const [arquivo, setArquivo] = useState(null);
  const [erro, setErro] = useState(null);
  const [enviando, setEnviando] = useState(false);

  const fechar = () => {
    setArquivo(null);
    setErro(null);
    aoFechar();
  };

  const enviar = async (evento) => {
    evento.preventDefault();
    if (!arquivo) {
      setErro("Escolha o arquivo do resultado.");
      return;
    }
    if (arquivo.size > 10 * 1024 * 1024) {
      setErro("O arquivo deve ter até 10 MB.");
      return;
    }
    setEnviando(true);
    setErro(null);
    try {
      await aoEnviar(arquivo);
      fechar();
    } catch (falha) {
      setErro(falha.message);
    } finally {
      setEnviando(false);
    }
  };

  return (
    <Dialogo aberto={Boolean(exame)} aoFechar={fechar} titulo="Enviar resultado"
      descricao="PDF, PNG ou JPEG até 10 MB. O paciente e o médico são avisados.">
      <form className={dlg.formulario} onSubmit={enviar} noValidate>
        <div className={dlg.campo}>
          <label className={dlg.rotulo} htmlFor="resultado-arquivo">Arquivo</label>
          <input
            id="resultado-arquivo"
            type="file"
            accept="application/pdf,image/png,image/jpeg"
            className={dlg.input}
            onChange={(e) => setArquivo(e.target.files?.[0] ?? null)}
          />
        </div>
        {erro && <p className={dlg.erro} role="alert">{erro}</p>}
        <div className={dlg.acoes}>
          <button type="button" className={dlg.botaoSecundario} onClick={fechar}>Cancelar</button>
          <button type="submit" className={dlg.botaoPrimario} disabled={enviando}>{enviando ? "Enviando…" : "Enviar e liberar"}</button>
        </div>
      </form>
    </Dialogo>
  );
}
