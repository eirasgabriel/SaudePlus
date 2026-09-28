/**
 * Biblioteca de ícones SVG inline da área administrativa.
 * Todos herdam a cor via `currentColor`.
 *
 * A classe `spIcone` (definida em styles/tokens.css) protege o tamanho
 * contra a regra `svg { width:24px !important }` do global.css antigo.
 *
 * Uso: <Icone nome="calendario" tam={20} />
 */

const tracos = {
  /* --- navegação --- */
  sair: (
    <>
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <path d="M16 17l5-5-5-5" />
      <path d="M21 12H9" />
    </>
  ),
  home: (
    <>
      <path d="M3 10.5 12 3l9 7.5" />
      <path d="M5 9.5V21h14V9.5" />
    </>
  ),
  usuario: (
    <>
      <circle cx="12" cy="8" r="3.5" />
      <path d="M5 20c0-3.5 3-6 7-6s7 2.5 7 6" />
    </>
  ),
  usuarios: (
    <>
      <circle cx="9" cy="8" r="3.2" />
      <path d="M3 19c0-3.3 2.7-5.5 6-5.5s6 2.2 6 5.5" />
      <path d="M16.5 6.2a3 3 0 0 1 0 5.6M18 19c0-2.6-1-4.3-2.5-5.2" />
    </>
  ),
  predio: (
    <>
      <rect x="4" y="3" width="16" height="18" rx="2" />
      <path d="M9 8h2M13 8h2M9 12h2M13 12h2M10 21v-3h4v3" />
    </>
  ),
  clinica: (
    <>
      <rect x="3" y="4" width="18" height="16" rx="2.5" />
      <path d="M12 9v6M9 12h6" />
    </>
  ),
  calendario: (
    <>
      <rect x="3" y="5" width="18" height="16" rx="2" />
      <path d="M8 3v4M16 3v4M3 10h18" />
    </>
  ),
  calendarioCheck: (
    <>
      <rect x="3" y="5" width="18" height="16" rx="2" />
      <path d="M8 3v4M16 3v4M3 10h18M8 14h3M8 17h6" />
    </>
  ),
  calendarioMais: (
    <>
      <rect x="3" y="5" width="18" height="16" rx="2" />
      <path d="M8 3v4M16 3v4M3 10h18M12 13v5M9.5 15.5h5" />
    </>
  ),
  documento: (
    <>
      <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" />
      <path d="M14 3v5h5M9 13h6M9 17h4" />
    </>
  ),
  grafico: (
    <>
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <path d="M8 16v-4M12 16V8M16 16v-6" />
    </>
  ),
  banco: (
    <>
      <path d="M3 9.5 12 4l9 5.5" />
      <path d="M5 10v8M9.5 10v8M14.5 10v8M19 10v8M3 21h18" />
    </>
  ),
  engrenagem: (
    <>
      <circle cx="12" cy="12" r="3.2" />
      <path d="M12 2.5v3M12 18.5v3M21.5 12h-3M5.5 12h-3M18.7 5.3l-2.1 2.1M7.4 16.6l-2.1 2.1M18.7 18.7l-2.1-2.1M7.4 7.4 5.3 5.3" />
    </>
  ),
  suporte: (
    <>
      <path d="M4 14v-2a8 8 0 0 1 16 0v2" />
      <path d="M4 14.5A2.5 2.5 0 0 1 6.5 12H8v5H6.5A2.5 2.5 0 0 1 4 14.5ZM20 14.5A2.5 2.5 0 0 0 17.5 12H16v5h1.5A2.5 2.5 0 0 0 20 14.5Z" />
      <path d="M16 18.5c-.9 1.1-2.1 1.7-3.7 1.7" />
    </>
  ),

  /* --- ações e controles --- */
  busca: (
    <>
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" />
    </>
  ),
  sino: (
    <>
      <path d="M18 8a6 6 0 1 0-12 0c0 7-3 8-3 8h18s-3-1-3-8" />
      <path d="M13.7 21a2 2 0 0 1-3.4 0" />
    </>
  ),
  mais: <path d="M12 5v14M5 12h14" />,
  setaDireita: <path d="M5 12h14M13 6l6 6-6 6" />,
  setaEsquerda: <path d="M19 12H5M11 6l-6 6 6 6" />,
  chevronBaixo: <path d="m6 9 6 6 6-6" />,
  chevronCima: <path d="m6 15 6-6 6 6" />,
  chevronDireita: <path d="m9 6 6 6-6 6" />,
  chevronEsquerda: <path d="m15 6-6 6 6 6" />,
  lapis: (
    <>
      <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7.5 18.5 3 20l1.5-4.5z" />
      <path d="m14.5 5.5 3 3" />
    </>
  ),
  lixeira: (
    <>
      <path d="M4 7h16M10 4h4M6 7l1 13h10l1-13" />
      <path d="M10 11v5M14 11v5" />
    </>
  ),
  olho: (
    <>
      <path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12" />
      <circle cx="12" cy="12" r="3" />
    </>
  ),
  maisOpcoes: (
    <>
      <circle cx="12" cy="5.5" r="1.4" fill="currentColor" stroke="none" />
      <circle cx="12" cy="12" r="1.4" fill="currentColor" stroke="none" />
      <circle cx="12" cy="18.5" r="1.4" fill="currentColor" stroke="none" />
    </>
  ),
  filtro: <path d="M3 5h18l-7 8v6l-4 2v-8z" />,
  baixar: (
    <>
      <path d="M12 3v12M7.5 10.5 12 15l4.5-4.5" />
      <path d="M4 18.5V20a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-1.5" />
    </>
  ),
  enviar: <path d="M21 3 10.5 13.5M21 3l-6.5 18-4-8-8-4z" />,
  atualizar: (
    <>
      <path d="M20 12a8 8 0 1 1-2.6-5.9" />
      <path d="M20 4v4h-4" />
    </>
  ),

  /* --- status e sinais --- */
  alerta: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7.5v5.5M12 16.2v.3" />
    </>
  ),
  alertaX: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="m9.2 9.2 5.6 5.6M14.8 9.2l-5.6 5.6" />
    </>
  ),
  check: <path d="m5 12.5 4.5 4.5L19 7.5" />,
  checkCirculo: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="m8 12.2 2.8 2.8L16 9.8" />
    </>
  ),
  relogio: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5.3l3.4 2" />
    </>
  ),
  cadeado: (
    <>
      <rect x="4.5" y="10" width="15" height="10.5" rx="2.5" />
      <path d="M8 10V7.5a4 4 0 0 1 8 0V10" />
    </>
  ),
  cadeadoAberto: (
    <>
      <rect x="4.5" y="10" width="15" height="10.5" rx="2.5" />
      <path d="M8 10V7.5a4 4 0 0 1 7.6-1.7" />
    </>
  ),
  escudo: (
    <>
      <path d="M12 2.5 4.5 5.5v6c0 4.7 3.2 8.6 7.5 10 4.3-1.4 7.5-5.3 7.5-10v-6z" />
      <path d="M12 8v6M9 11h6" />
    </>
  ),
  escudoCheck: (
    <>
      <path d="M12 2.5 4.5 5.5v6c0 4.7 3.2 8.6 7.5 10 4.3-1.4 7.5-5.3 7.5-10v-6z" />
      <path d="m8.8 11.8 2.3 2.3 4.1-4.6" />
    </>
  ),
  escudoCadeado: (
    <>
      <path d="M12 2.5 4.5 5.5v6c0 4.7 3.2 8.6 7.5 10 4.3-1.4 7.5-5.3 7.5-10v-6z" />
      <rect x="9.3" y="11" width="5.4" height="4.6" rx="1" />
      <path d="M10.4 11V9.9a1.6 1.6 0 0 1 3.2 0V11" />
    </>
  ),
  coracao: (
    <path d="M20.4 5.6a5 5 0 0 0-7.1 0L12 6.9l-1.3-1.3a5 5 0 1 0-7.1 7.1l8.4 8.4 8.4-8.4a5 5 0 0 0 0-7.1z" />
  ),
  estrela: (
    <path d="m12 3 2.6 5.6 6.1.8-4.5 4.2 1.2 6L12 16.8 6.6 19.6l1.2-6-4.5-4.2 6.1-.8z" />
  ),
  raio: <path d="M13 2 4.5 13.5H11l-1 8.5 8.5-11.5H12z" />,
  lampada: (
    <>
      <path d="M9.5 18h5M10 21h4" />
      <path d="M12 3a6 6 0 0 0-3.5 10.9c.6.5 1 1.2 1 2h5c0-.8.4-1.5 1-2A6 6 0 0 0 12 3" />
    </>
  ),
  info: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 11v5.5M12 7.8v.3" />
    </>
  ),
  interrogacao: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M9.6 9.3a2.5 2.5 0 1 1 3.4 2.4c-.6.3-1 .9-1 1.6v.4M12 16.8v.3" />
    </>
  ),

  /* --- comunicação --- */
  email: (
    <>
      <rect x="3" y="5" width="18" height="14" rx="2.5" />
      <path d="m3.5 7 8.5 6 8.5-6" />
    </>
  ),
  telefone: (
    <path d="M6.5 3h3l1.5 4-2 1.5a12 12 0 0 0 5.5 5.5L16 12l4 1.5v3a2 2 0 0 1-2.2 2A16.5 16.5 0 0 1 4.5 5.2 2 2 0 0 1 6.5 3" />
  ),
  chat: (
    <>
      <path d="M20.5 12.5a7.5 7.5 0 0 1-10.6 6.8L4 21l1.7-5.2A7.5 7.5 0 1 1 20.5 12.5" />
      <path d="M9 11.5h.01M12.5 11.5h.01M16 11.5h.01" />
    </>
  ),
  chatDuplo: (
    <>
      <path d="M17.5 13.5H9l-3.5 3v-3H4a1.5 1.5 0 0 1-1.5-1.5v-7A1.5 1.5 0 0 1 4 3.5h13.5A1.5 1.5 0 0 1 19 5v7a1.5 1.5 0 0 1-1.5 1.5" />
      <path d="M8 17v1.5A1.5 1.5 0 0 0 9.5 20h6l3.5 2.5V20h.5a1.5 1.5 0 0 0 1.5-1.5v-5" />
    </>
  ),
  localizacao: (
    <>
      <path d="M12 21s7-6.2 7-11a7 7 0 1 0-14 0c0 4.8 7 11 7 11" />
      <circle cx="12" cy="10" r="2.8" />
    </>
  ),
  celular: (
    <>
      <rect x="7" y="2.5" width="10" height="19" rx="2.5" />
      <path d="M10.8 18.6h2.4" />
    </>
  ),
  monitor: (
    <>
      <rect x="3" y="4" width="18" height="12.5" rx="2" />
      <path d="M9 20.5h6M12 16.5v4" />
    </>
  ),
  globo: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M3.2 9.5h17.6M3.2 14.5h17.6" />
      <path d="M12 3a15 15 0 0 1 0 18 15 15 0 0 1 0-18" />
    </>
  ),
  link: (
    <>
      <path d="M10.5 13.5a4 4 0 0 0 5.7 0l2.3-2.3a4 4 0 0 0-5.7-5.7l-1.2 1.2" />
      <path d="M13.5 10.5a4 4 0 0 0-5.7 0l-2.3 2.3a4 4 0 0 0 5.7 5.7l1.2-1.2" />
    </>
  ),
  codigo: <path d="m8.5 8-4 4 4 4M15.5 8l4 4-4 4M13.5 5l-3 14" />,
  megafone: (
    <>
      <path d="M4 10v4a1.5 1.5 0 0 0 1.5 1.5H8l6 4.5V5.5L8 10z" />
      <path d="M17.5 9a4.5 4.5 0 0 1 0 6" />
    </>
  ),
  play: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M10.2 8.5 15.5 12l-5.3 3.5z" />
    </>
  ),
  aperto: (
    <path d="M7 11 4 8l4-4 3 2h2l3-2 4 4-3 3v4l-3.5 3.5-2.5-2.5-2.5 2.5L7 15z" />
  ),

  /* --- financeiro --- */
  carteira: (
    <>
      <rect x="3" y="6" width="18" height="13" rx="2.5" />
      <path d="M3 10h18M16.5 14.5h.01" />
    </>
  ),
  cifrao: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M14.5 9.3a2.8 2.8 0 0 0-2.5-1.3c-1.5 0-2.6.8-2.6 2s1 1.7 2.6 2 2.7.8 2.7 2-1.1 2-2.7 2a2.9 2.9 0 0 1-2.6-1.4M12 6.3v1.7M12 16v1.7" />
    </>
  ),
  cartao: (
    <>
      <rect x="2.5" y="5.5" width="19" height="13" rx="2.5" />
      <path d="M2.5 10h19M6 14.5h3" />
    </>
  ),
  dinheiro: (
    <>
      <rect x="2.5" y="6" width="19" height="12" rx="2" />
      <circle cx="12" cy="12" r="2.6" />
      <path d="M6 12h.01M18 12h.01" />
    </>
  ),
  bancoDados: (
    <>
      <ellipse cx="12" cy="6" rx="7.5" ry="3" />
      <path d="M4.5 6v12c0 1.7 3.4 3 7.5 3s7.5-1.3 7.5-3V6" />
      <path d="M4.5 12c0 1.7 3.4 3 7.5 3s7.5-1.3 7.5-3" />
    </>
  ),
  nuvem: (
    <path d="M7 19a4.5 4.5 0 0 1-.4-9A6 6 0 0 1 18 11.2a3.9 3.9 0 0 1-.6 7.8z" />
  ),
  sol: (
    <>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2.5v2M12 19.5v2M21.5 12h-2M4.5 12h-2M18.4 5.6l-1.4 1.4M7 17l-1.4 1.4M18.4 18.4 17 17M7 7 5.6 5.6" />
    </>
  ),
  lua: <path d="M20 14.5A8.5 8.5 0 1 1 9.5 4a7 7 0 0 0 10.5 10.5" />,
  imagem: (
    <>
      <rect x="3" y="4.5" width="18" height="15" rx="2.5" />
      <circle cx="8.5" cy="10" r="1.6" />
      <path d="m4 17 5-4.5 4 3.5 3-2.5 4 3.5" />
    </>
  ),
  upload: (
    <>
      <path d="M12 16V4M7.5 8.5 12 4l4.5 4.5" />
      <path d="M4 17.5V19a1.5 1.5 0 0 0 1.5 1.5h13A1.5 1.5 0 0 0 20 19v-1.5" />
    </>
  ),
  tendenciaCima: (
    <>
      <path d="M3 16.5 9 10l4 4 8-8.5" />
      <path d="M15.5 5.5H21v5.5" />
    </>
  ),
  frasco: (
    <>
      <path d="M10 3v6.5L5.5 18A2 2 0 0 0 7.2 21h9.6a2 2 0 0 0 1.7-3L14 9.5V3" />
      <path d="M9 3h6M7.5 15h9" />
    </>
  ),
  estetoscopio: (
    <>
      <path d="M6 3v5a4 4 0 0 0 8 0V3" />
      <path d="M10 12v2a5 5 0 0 0 10 0v-1" />
      <circle cx="20" cy="10.5" r="2" />
      <path d="M6 3H4.5M14 3h1.5" />
    </>
  ),
};

export default function Icone({ nome, tam = 20, espessura = 2, className = "", ...resto }) {
  const conteudo = tracos[nome];

  if (!conteudo) {
    if (import.meta.env?.DEV) console.warn(`[Icone] "${nome}" não existe.`);
    return null;
  }

  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={espessura}
      strokeLinecap="round"
      strokeLinejoin="round"
      /* spIcone + a variável protegem o tamanho do `!important` do global.css */
      className={`spIcone ${className}`}
      style={{ "--sp-icone": `${tam}px` }}
      aria-hidden="true"
      focusable="false"
      {...resto}
    >
      {conteudo}
    </svg>
  );
}

/** Avatar genérico preenchido, para quando não há foto. */
export function IconeAvatar({ tam = 24, className = "" }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={`spIcone ${className}`}
      style={{ "--sp-icone": `${tam}px` }}
      aria-hidden="true"
      focusable="false"
    >
      <circle cx="12" cy="8" r="4" />
      <path d="M12 14c-4.4 0-8 2.7-8 6h16c0-3.3-3.6-6-8-6z" />
    </svg>
  );
}
