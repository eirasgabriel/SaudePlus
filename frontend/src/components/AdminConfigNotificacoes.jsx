import { useState } from "react";
import Cartao from "./Cartao";
import Icone from "./Icone";
import Etiqueta from "./Etiqueta";
import ItemLista, { Lista } from "./ItemLista";
import { Interruptor, Seletor } from "./Controles";
import {
  canaisNotificacao,
  tiposNotificacao,
  horariosEnvio,
  opcoesHora,
  modelosMensagem,
} from "../services/dadosAdminConfiguracoes";
import comum from "../styles/adminComum.module.css";
import estilos from "../styles/adminConfig.module.css";

export default function AdminConfigNotificacoes() {
  const [canais, definirCanais] = useState(canaisNotificacao);
  const [tipos, definirTipos] = useState(tiposNotificacao);
  const [horarios, definirHorarios] = useState(horariosEnvio);

  function alternarCanal(id, ativo) {
    definirCanais((atuais) => atuais.map((c) => (c.id === id ? { ...c, ativo } : c)));
  }

  function alternarTipo(id) {
    definirTipos((atuais) =>
      atuais.map((t) => (t.id === id ? { ...t, ativo: !t.ativo } : t))
    );
  }

  function ajustarHorario(id, campo, valor) {
    definirHorarios((atuais) =>
      atuais.map((h) => (h.id === id ? { ...h, [campo]: valor } : h))
    );
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
                <Interruptor
                  ligado={c.ativo}
                  aoAlternar={(v) => alternarCanal(c.id, v)}
                  rotulo={c.titulo}
                />
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
              comSeta
              aoClicar={() => alternarTipo(t.id)}
              direita={
                <Etiqueta variante={t.ativo ? "sucesso" : "neutro"}>
                  {t.ativo ? "Ativo" : "Inativo"}
                </Etiqueta>
              }
            />
          ))}
        </Lista>
      </Cartao>

      {/* ---------- horários e modelos ---------- */}
      <div className={estilos.coluna}>
        <Cartao
          titulo="Horários de Envio"
          subtitulo="Defina os horários em que as notificações podem ser enviadas."
          icone="relogio"
        >
          {horarios.map((h) => (
            <div key={h.id} className={estilos.horarioLinha}>
              <span className={estilos.horarioRotulo}>{h.rotulo}</span>
              <Seletor
                valor={h.inicio}
                aoMudar={(v) => ajustarHorario(h.id, "inicio", v)}
                opcoes={opcoesHora}
                rotulo={`${h.rotulo} — início`}
              />
              <span className={estilos.horarioTraco}>–</span>
              <Seletor
                valor={h.fim}
                aoMudar={(v) => ajustarHorario(h.id, "fim", v)}
                opcoes={opcoesHora}
                rotulo={`${h.rotulo} — fim`}
              />
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
                aoClicar={() => {}}
              />
            ))}
          </Lista>
        </Cartao>

        <div className={comum.aviso}>
          <Icone nome="info" tam={17} className={comum.avisoIcone} />
          <div>
            <div className={comum.avisoTitulo}>Importante</div>
            <p className={comum.avisoTexto}>
              As notificações ajudam a melhorar a comunicação com os pacientes e
              profissionais, reduzindo faltas e agilizando o acesso às informações.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
