import { useState } from "react";
import Cartao from "./Cartao";
import Icone from "./Icone";
import Etiqueta from "./Etiqueta";
import ItemLista, { Lista } from "./ItemLista";
import { Botao, Interruptor, Seletor } from "./Controles";
import {
  canaisNotificacao,
  tiposNotificacao,
  horariosEnvio,
  opcoesHora,
  modelosMensagem,
} from "../services/dadosAdminConfiguracoes";
import comum from "../styles/adminComum.module.css";
import estilos from "../styles/adminConfig.module.css";
import { avisarEmBreve } from "./AvailabilityNotice/emBreve.js";

/** Liga o que veio gravado (`{ canais: { sistema: false } }`) aos itens da tela. */
const comValores = (itens, gravados = {}) =>
  itens.map((item) => ({ ...item, ativo: typeof gravados[item.id] === "boolean" ? gravados[item.id] : item.ativo }));

/** Só os itens que o servidor aplica vão para o grupo `notificacoes`. */
const paraGravar = (itens) =>
  Object.fromEntries(itens.filter((i) => i.disponivel !== false && !i.fixo).map((i) => [i.id, i.ativo]));

const EmBreve = () => <Etiqueta variante="neutro">Em breve</Etiqueta>;

/**
 * Notificações do sistema. Com a API (`valores`, `aoSalvar`), "Notificações
 * no sistema" e os tipos Agendamentos, Resultados de exames e Mensagens do
 * sistema são gravados e valem para todos: desligados, o servidor não grava
 * a notificação. SMS, push, horários de envio e modelos ainda não existem e
 * aparecem como "Em breve".
 */
export default function AdminConfigNotificacoes({ valores, aoSalvar }) {
  const [canais, definirCanais] = useState(() => comValores(canaisNotificacao, valores?.canais));
  const [tipos, definirTipos] = useState(() => comValores(tiposNotificacao, valores?.tipos));
  const [salvando, definirSalvando] = useState(false);
  const [mensagem, definirMensagem] = useState(null);

  function alternarCanal(id, ativo) {
    definirMensagem(null);
    definirCanais((atuais) => atuais.map((c) => (c.id === id ? { ...c, ativo } : c)));
  }

  function alternarTipo(id) {
    definirMensagem(null);
    definirTipos((atuais) =>
      atuais.map((t) => (t.id === id ? { ...t, ativo: !t.ativo } : t))
    );
  }

  async function salvar() {
    definirSalvando(true);
    definirMensagem(null);
    try {
      await aoSalvar({ canais: paraGravar(canais), tipos: paraGravar(tipos) });
      definirMensagem({ tom: "sucesso", texto: "Notificações salvas. Valem para os próximos avisos." });
    } catch (falha) {
      definirMensagem({ tom: "erro", texto: falha?.message ?? "Não foi possível salvar." });
    } finally {
      definirSalvando(false);
    }
  }

  return (
    <div className={estilos.gradePrincipal}>
      {/* ---------- canais e tipos ---------- */}
      <Cartao
        titulo="Configurações de Notificações"
        subtitulo="Configure como e quando o sistema deve enviar notificações para os usuários."
        icone="sino"
      >
        <h3 className={comum.secao}>Canais de Notificação</h3>
        <Lista>
          {canais.map((c) => (
            <ItemLista
              key={c.id}
              icone={c.icone}
              titulo={c.titulo}
              descricao={c.descricao}
              direita={
                c.disponivel === false ? <EmBreve /> : c.fixo ? (
                  <Etiqueta variante="sucesso">{c.fixo}</Etiqueta>
                ) : (
                  <Interruptor
                    ligado={c.ativo}
                    aoAlternar={(v) => alternarCanal(c.id, v)}
                    rotulo={c.titulo}
                    desabilitado={!aoSalvar}
                  />
                )
              }
            />
          ))}
        </Lista>

        <h3 className={`${comum.secao} ${comum.secaoEspacada}`}>
          Tipos de Notificações
        </h3>
        <Lista>
          {tipos.map((t) => (
            <ItemLista
              key={t.id}
              icone={t.icone}
              titulo={t.titulo}
              descricao={t.descricao}
              comSeta={t.disponivel !== false && Boolean(aoSalvar)}
              aoClicar={t.disponivel !== false && aoSalvar ? () => alternarTipo(t.id) : undefined}
              direita={
                t.disponivel === false ? <EmBreve /> : (
                  <Etiqueta variante={t.ativo ? "sucesso" : "neutro"}>
                    {t.ativo ? "Ativo" : "Inativo"}
                  </Etiqueta>
                )
              }
            />
          ))}
        </Lista>

        {aoSalvar && (
          <div className={estilos.formulario} style={{ marginTop: 16 }}>
            {mensagem && (
              <p
                role={mensagem.tom === "erro" ? "alert" : "status"}
                style={{ margin: 0, fontSize: 13, color: mensagem.tom === "erro" ? "var(--state-danger)" : undefined }}
              >
                {mensagem.texto}
              </p>
            )}
            <Botao icone="baixar" onClick={salvar} disabled={salvando}>
              {salvando ? "Salvando…" : "Salvar notificações"}
            </Botao>
          </div>
        )}
      </Cartao>

      {/* ---------- horários e modelos ---------- */}
      <div className={estilos.coluna}>
        <Cartao
          titulo="Horários de Envio"
          subtitulo="Em breve: hoje os avisos chegam na hora em que acontecem."
          icone="relogio"
        >
          {horariosEnvio.map((h) => (
            <div key={h.id} className={estilos.horarioLinha} aria-disabled="true" style={{ opacity: 0.6, pointerEvents: "none" }}>
              <span className={estilos.horarioRotulo}>{h.rotulo}</span>
              <Seletor valor={h.inicio} aoMudar={() => {}} opcoes={opcoesHora} rotulo={`${h.rotulo} — início`} />
              <span className={estilos.horarioTraco}>–</span>
              <Seletor valor={h.fim} aoMudar={() => {}} opcoes={opcoesHora} rotulo={`${h.rotulo} — fim`} />
            </div>
          ))}
        </Cartao>

        <Cartao
          titulo="Modelos de Mensagens"
          subtitulo="Personalize os modelos de e-mails e textos."
          icone="documento"
        >
          <Lista>
            {modelosMensagem.map((m) => (
              <ItemLista
                key={m.id}
                icone={m.icone}
                titulo={m.titulo}
                comSeta
                aoClicar={() => avisarEmBreve(`Modelo: ${m.titulo}`)}
              />
            ))}
          </Lista>
        </Cartao>

        <div className={comum.aviso}>
          <Icone nome="info" tam={17} className={comum.avisoIcone} />
          <div>
            <div className={comum.avisoTitulo}>Importante</div>
            <p className={comum.avisoTexto}>
              Desligar um tipo vale para todos os usuários: pacientes, médicos,
              clínicas e equipe deixam de receber esses avisos no sistema.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
