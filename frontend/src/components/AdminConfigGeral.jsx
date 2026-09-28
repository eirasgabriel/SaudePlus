import { useState } from "react";
import Cartao from "./Cartao";
import Icone from "./Icone";
import Etiqueta from "./Etiqueta";
import ItemLista, { Lista } from "./ItemLista";
import { Campo, Seletor, Botao, Interruptor } from "./Controles";
import {
  configuracoesGerais,
  opcoesIdioma,
  opcoesFuso,
  notificacoesSistema,
  backupSistema,
  informacoesSistema,
} from "../services/dadosAdminConfiguracoes";
import comum from "../styles/adminComum.module.css";
import estilos from "../styles/adminConfig.module.css";

export default function AdminConfigGeral() {
  const [form, definirForm] = useState(configuracoesGerais);
  const [notificacoes, definirNotificacoes] = useState(notificacoesSistema);
  const [salvo, definirSalvo] = useState(false);

  function atualizar(chave, valor) {
    definirForm((atual) => ({ ...atual, [chave]: valor }));
    definirSalvo(false);
  }

  function alternarNotificacao(id, ativo) {
    definirNotificacoes((atuais) =>
      atuais.map((n) => (n.id === id ? { ...n, ativo } : n))
    );
  }

  function salvar() {
    definirSalvo(true);
    setTimeout(() => definirSalvo(false), 2500);
  }

  return (
    <div className={estilos.grade3}>
      {/* ---------- coluna 1: dados gerais ---------- */}
      <Cartao titulo="Configurações Gerais" icone="engrenagem">
        <div className={estilos.formulario}>
          <Campo
            rotulo="Nome do sistema"
            valor={form.nomeSistema}
            aoMudar={(v) => atualizar("nomeSistema", v)}
          />
          <Campo
            rotulo="Descrição"
            valor={form.descricao}
            aoMudar={(v) => atualizar("descricao", v)}
            linhas={3}
            maximo={200}
          />
          <Campo
            rotulo="E-mail de suporte"
            tipo="email"
            icone="email"
            valor={form.emailSuporte}
            aoMudar={(v) => atualizar("emailSuporte", v)}
          />
          <Campo
            rotulo="Telefone de contato"
            icone="telefone"
            valor={form.telefone}
            aoMudar={(v) => atualizar("telefone", v)}
          />
          <Campo
            rotulo="Endereço do sistema"
            icone="localizacao"
            valor={form.endereco}
            aoMudar={(v) => atualizar("endereco", v)}
          />
          <Seletor
            rotulo="Idioma padrão"
            icone="globo"
            valor={form.idioma}
            aoMudar={(v) => atualizar("idioma", v)}
            opcoes={opcoesIdioma}
          />
          <Seletor
            rotulo="Fuso horário"
            icone="relogio"
            valor={form.fusoHorario}
            aoMudar={(v) => atualizar("fusoHorario", v)}
            opcoes={opcoesFuso}
          />

          <Botao icone={salvo ? "check" : "baixar"} onClick={salvar}>
            {salvo ? "Alterações salvas" : "Salvar alterações"}
          </Botao>
        </div>
      </Cartao>

      {/* ---------- coluna 2: personalização e backup ---------- */}
      <div className={estilos.coluna}>
        <Cartao titulo="Personalização" icone="imagem">
          <div className={estilos.formulario}>
            <div>
              <span className={estilos.rotuloCor}>Logo do sistema</span>
              <div className={estilos.blocoLogo} style={{ marginTop: 6 }}>
                <span className={estilos.logoPreview}>
                  <Icone nome="escudo" tam={26} />
                  <span>Saúde</span>
                  <span>Plus</span>
                </span>
                <Botao variante="secundario" icone="upload">
                  Alterar logo
                </Botao>
                <span className={estilos.dicaArquivo}>
                  Formatos aceitos: JPG, PNG. Tamanho máximo de 2MB.
                </span>
              </div>
            </div>

            <div className={estilos.campoCor}>
              <span className={estilos.rotuloCor}>Cor principal</span>
              <div className={estilos.linhaCor}>
                <input
                  type="color"
                  className={estilos.amostra}
                  value={form.corPrincipal}
                  onChange={(e) => atualizar("corPrincipal", e.target.value)}
                  aria-label="Escolher cor principal"
                />
                <input
                  className={estilos.valorCor}
                  value={form.corPrincipal}
                  onChange={(e) => atualizar("corPrincipal", e.target.value)}
                  aria-label="Código da cor principal"
                />
                <Icone nome="lapis" tam={15} />
              </div>
            </div>

            <div className={estilos.campoCor}>
              <span className={estilos.rotuloCor}>Cor secundária</span>
              <div className={estilos.linhaCor}>
                <input
                  type="color"
                  className={estilos.amostra}
                  value={form.corSecundaria}
                  onChange={(e) => atualizar("corSecundaria", e.target.value)}
                  aria-label="Escolher cor secundária"
                />
                <input
                  className={estilos.valorCor}
                  value={form.corSecundaria}
                  onChange={(e) => atualizar("corSecundaria", e.target.value)}
                  aria-label="Código da cor secundária"
                />
                <Icone nome="lapis" tam={15} />
              </div>
            </div>

            <div>
              <span className={estilos.rotuloCor}>Tema da interface</span>
              <div className={estilos.temas} style={{ marginTop: 6 }}>
                {[
                  { id: "claro", rotulo: "Claro", icone: "sol" },
                  { id: "escuro", rotulo: "Escuro", icone: "lua" },
                ].map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    className={`${estilos.tema} ${
                      form.tema === t.id ? estilos.temaAtivo : ""
                    }`}
                    onClick={() => atualizar("tema", t.id)}
                    aria-pressed={form.tema === t.id}
                  >
                    <Icone nome={t.icone} tam={18} />
                    {t.rotulo}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </Cartao>

        <Cartao titulo="Backup do Sistema" icone="bancoDados">
          <div className={estilos.backup}>
            <Icone nome="bancoDados" tam={19} className={estilos.backupIcone} />
            <div className={estilos.backupTexto}>
              Último backup realizado em:
              <strong className={estilos.backupData}>{backupSistema.ultimo}</strong>
            </div>
            <Etiqueta variante="sucesso">{backupSistema.status}</Etiqueta>
          </div>

          <div className={estilos.backupBotoes}>
            <Botao icone="nuvem">Fazer backup agora</Botao>
            <Botao variante="secundario" icone="atualizar">
              Restaurar backup
            </Botao>
          </div>
        </Cartao>
      </div>

      {/* ---------- coluna 3: notificações e informações ---------- */}
      <div className={estilos.coluna}>
        <Cartao titulo="Notificações do Sistema" icone="sino">
          <Lista>
            {notificacoes.map((n) => (
              <ItemLista
                key={n.id}
                icone="sino"
                titulo={n.titulo}
                descricao={n.descricao}
                direita={
                  <Interruptor
                    ligado={n.ativo}
                    aoAlternar={(v) => alternarNotificacao(n.id, v)}
                    rotulo={n.titulo}
                  />
                }
              />
            ))}
          </Lista>
        </Cartao>

        <Cartao titulo="Informações do Sistema" icone="info">
          <div className={comum.pares}>
            {informacoesSistema.map((info) => (
              <div key={info.rotulo} className={comum.par}>
                <span className={comum.parRotulo}>{info.rotulo}</span>
                <span className={comum.parValor}>{info.valor}</span>
              </div>
            ))}
          </div>

          <div className={comum.aviso} style={{ marginTop: 14 }}>
            <Icone nome="suporte" tam={17} className={comum.avisoIcone} />
            <div>
              <div className={comum.avisoTitulo}>Precisa de ajuda?</div>
              <p className={comum.avisoTexto}>
                Entre em contato com o suporte técnico em caso de dúvidas ou problemas.
              </p>
              <Botao variante="secundario" icone="email" style={{ marginTop: 10 }}>
                Abrir chamado
              </Botao>
            </div>
          </div>
        </Cartao>
      </div>
    </div>
  );
}
