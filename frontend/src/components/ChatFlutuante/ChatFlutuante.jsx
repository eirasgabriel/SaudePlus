import { useCallback, useEffect, useId, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ChatDotsIcon } from "../icons/Icons.jsx";
import { ASSUNTOS, NAO_ENTENDI, SAUDACAO, encontrarAssunto } from "./respostas.js";
import { ChatOnlineContexto } from "./chatOnline.js";
import styles from "./ChatFlutuante.module.css";

const CHAVE = "saudeplus:chat-online";
const inicial = () => [{ id: 0, de: "assistente", texto: SAUDACAO }];

/* A conversa vale para a sessão da aba: sobrevive à navegação e some quando a
   aba fecha. Sem sessionStorage (modo privado, bloqueio), fica só na memória. */
function lerConversa() {
  try {
    const salvas = JSON.parse(window.sessionStorage.getItem(CHAVE));
    if (Array.isArray(salvas) && salvas.length) return salvas;
  } catch {
    /* ignora: começa do zero */
  }
  return inicial();
}

/**
 * Chat online: botão flutuante no canto inferior direito que abre um popup.
 * Ainda sem atendimento com pessoas: o assistente responde com o conteúdo das
 * Perguntas frequentes (ver respostas.js) e diz quando não sabe responder.
 * A conversa dura a sessão da aba (sessionStorage) e recomeça quando ela fecha.
 *
 * Envolve `children` para que qualquer tela abra o chat com useChatOnline().
 * `mostrarBotao={false}` esconde o botão flutuante (a Ajuda abre o chat pelo
 * cartão "Chat online"); aí o foco volta para quem abriu ao fechar.
 */
export default function ChatFlutuante({ children, mostrarBotao = true }) {
  const [aberto, setAberto] = useState(false);
  const [mensagens, setMensagens] = useState(lerConversa);
  const [rascunho, setRascunho] = useState("");
  const proximoId = useRef(Math.max(...mensagens.map((m) => m.id)) + 1);
  const botaoRef = useRef(null);
  const quemAbriu = useRef(null);
  const campoRef = useRef(null);
  const listaRef = useRef(null);
  const painelId = useId();
  const tituloId = useId();

  const fechar = () => {
    setAberto(false);
    (mostrarBotao ? botaoRef.current : quemAbriu.current)?.focus?.();
  };

  const abrir = useCallback(() => {
    quemAbriu.current = document.activeElement;
    setAberto(true);
  }, []);
  const contexto = useMemo(() => ({ abrir }), [abrir]);

  // Ao abrir, o foco vai para o campo de mensagem.
  useEffect(() => {
    if (aberto) campoRef.current?.focus();
  }, [aberto]);

  useEffect(() => {
    try {
      window.sessionStorage.setItem(CHAVE, JSON.stringify(mensagens));
    } catch {
      /* sem armazenamento: a conversa fica só na memória */
    }
  }, [mensagens]);

  // Mantém a última mensagem à vista.
  useEffect(() => {
    const lista = listaRef.current;
    if (lista) lista.scrollTop = lista.scrollHeight;
  }, [mensagens, aberto]);

  const responder = (pergunta, assunto) => {
    const resposta = assunto ? { texto: assunto.resposta, link: assunto.link } : NAO_ENTENDI;
    const id = proximoId.current;
    proximoId.current += 2;
    setMensagens((atuais) => [
      ...atuais,
      { id, de: "usuario", texto: pergunta },
      { id: id + 1, de: "assistente", ...resposta },
    ]);
  };

  const aoEnviar = (evento) => {
    evento.preventDefault();
    const texto = rascunho.trim();
    if (!texto) return;
    responder(texto, encontrarAssunto(texto));
    setRascunho("");
  };

  return (
    <ChatOnlineContexto.Provider value={contexto}>
    {children}
    <div className={styles.raiz}>
      {aberto && (
        <section
          id={painelId}
          className={`${styles.painel} ${mostrarBotao ? "" : styles.semBotao}`}
          role="dialog"
          aria-labelledby={tituloId}
          onKeyDown={(e) => {
            if (e.key === "Escape") fechar();
          }}
        >
          <header className={styles.topo}>
            <span className={styles.avatar} aria-hidden="true">
              <ChatDotsIcon size={22} />
            </span>
            <div className={styles.identidade}>
              <h2 id={tituloId} className={styles.titulo}>Chat online</h2>
              <p className={styles.status}>Respostas automáticas</p>
            </div>
            <button type="button" className={styles.fechar} onClick={fechar} aria-label="Fechar chat">
              <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
                <path d="M6 6l12 12M18 6 6 18" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
              </svg>
            </button>
          </header>

          <ol ref={listaRef} className={styles.mensagens} role="log" aria-live="polite" aria-label="Conversa">
            {mensagens.map((m) => (
              <li key={m.id} className={m.de === "usuario" ? styles.doUsuario : styles.doAssistente}>
                <span className="sr-only">{m.de === "usuario" ? "Você: " : "Assistente: "}</span>
                <p className={styles.balao}>{m.texto}</p>
                {m.link && (
                  <Link to={m.link.para} className={styles.linkResposta} onClick={() => setAberto(false)}>
                    {m.link.rotulo} <span aria-hidden="true">→</span>
                  </Link>
                )}
              </li>
            ))}
          </ol>

          <div className={styles.sugestoes} role="group" aria-label="Assuntos sugeridos">
            {ASSUNTOS.map((a) => (
              <button key={a.id} type="button" className={styles.sugestao} onClick={() => responder(a.sugestao, a)}>
                {a.sugestao}
              </button>
            ))}
          </div>

          <form className={styles.compositor} onSubmit={aoEnviar}>
            <label htmlFor={`${painelId}-campo`} className="sr-only">Escreva sua dúvida</label>
            <input
              ref={campoRef}
              id={`${painelId}-campo`}
              className={styles.campo}
              type="text"
              placeholder="Escreva sua dúvida…"
              autoComplete="off"
              maxLength={300}
              value={rascunho}
              onChange={(e) => setRascunho(e.target.value)}
            />
            <button type="submit" className={styles.enviar} aria-label="Enviar" disabled={!rascunho.trim()}>
              <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
                <path d="M4 12 20 4l-6 16-3-7-7-1z" fill="currentColor" />
              </svg>
            </button>
          </form>
          <p className={styles.aviso}>Atendimento com pessoas em breve.</p>
        </section>
      )}

      {mostrarBotao && (
        <button
          ref={botaoRef}
          type="button"
          className={`${styles.botao} ${aberto ? styles.botaoAberto : ""}`}
          aria-expanded={aberto}
          aria-controls={aberto ? painelId : undefined}
          aria-label={aberto ? "Fechar chat online" : "Abrir chat online"}
          onClick={() => (aberto ? fechar() : abrir())}
        >
          <ChatDotsIcon size={24} className={styles.icone} />
          <span className={styles.rotulo} aria-hidden="true">Chat online</span>
        </button>
      )}
    </div>
    </ChatOnlineContexto.Provider>
  );
}
