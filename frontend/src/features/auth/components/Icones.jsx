/**
 * Icones em SVG inline, no mesmo tracado fino do layout.
 *
 * Ficam aqui em vez de virem de uma biblioteca para o projeto nao ganhar mais
 * uma dependencia so por causa de sete desenhos. Todos herdam a cor do texto
 * via `currentColor` e sao decorativos (aria-hidden): quem descreve o campo e
 * o <label>.
 */

const padrao = {
  width: 22,
  height: 22,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.7,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  'aria-hidden': true,
  focusable: false,
}

export function IconeEnvelope(props) {
  return (
    <svg {...padrao} {...props}>
      <rect x="2.5" y="4.5" width="19" height="15" rx="3.5" />
      <path d="m3.5 7.5 7.34 5.13a2 2 0 0 0 2.32 0L20.5 7.5" />
    </svg>
  )
}

export function IconeCadeado(props) {
  return (
    <svg {...padrao} {...props}>
      <rect x="4" y="10" width="16" height="11" rx="3.5" />
      <path d="M8 10V7.5a4 4 0 0 1 8 0V10" />
      <circle cx="12" cy="15.5" r="1.4" fill="currentColor" stroke="none" />
    </svg>
  )
}

export function IconePessoa(props) {
  return (
    <svg {...padrao} {...props}>
      <circle cx="12" cy="8" r="3.8" />
      <path d="M4.5 20c0-3.6 3.36-6 7.5-6s7.5 2.4 7.5 6" />
    </svg>
  )
}

export function IconeTelefone(props) {
  return (
    <svg {...padrao} {...props}>
      <path d="M8.2 3.5H5.9A2.4 2.4 0 0 0 3.5 6.2c0 7.9 6.4 14.3 14.3 14.3a2.4 2.4 0 0 0 2.7-2.4v-2.3a1.4 1.4 0 0 0-1.1-1.37l-3-.62a1.4 1.4 0 0 0-1.45.62l-.73 1.16a11.4 11.4 0 0 1-5.11-5.11l1.16-.73a1.4 1.4 0 0 0 .62-1.45l-.62-3A1.4 1.4 0 0 0 8.2 3.5Z" />
    </svg>
  )
}

export function IconeOlho(props) {
  return (
    <svg {...padrao} {...props}>
      <path d="M2.5 12S6 5.8 12 5.8 21.5 12 21.5 12 18 18.2 12 18.2 2.5 12 2.5 12Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  )
}

export function IconeOlhoCortado(props) {
  return (
    <svg {...padrao} {...props}>
      <path d="M9.9 5.98A9.9 9.9 0 0 1 12 5.8c6 0 9.5 6.2 9.5 6.2a17.4 17.4 0 0 1-3.28 4.02" />
      <path d="M6.5 7.7A17.2 17.2 0 0 0 2.5 12S6 18.2 12 18.2c1.53 0 2.9-.4 4.1-1.01" />
      <path d="M9.9 9.9a3 3 0 0 0 4.2 4.2" />
      <path d="m3.5 3.5 17 17" />
    </svg>
  )
}

export function IconeChevronEsquerda(props) {
  return (
    <svg {...padrao} strokeWidth={2.2} {...props}>
      <path d="M15 5 8 12l7 7" />
    </svg>
  )
}

export function IconeCoracao(props) {
  return (
    <svg
      width={22}
      height={22}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden
      focusable="false"
      {...props}
    >
      <path d="M12 20.6s-7.7-4.74-7.7-10.05A4.55 4.55 0 0 1 12 7.37a4.55 4.55 0 0 1 7.7 3.18C19.7 15.86 12 20.6 12 20.6Z" />
    </svg>
  )
}

export function IconeCheck(props) {
  return (
    <svg {...padrao} strokeWidth={2.4} {...props}>
      <path d="m4.5 12.5 4.8 4.8L19.5 7.2" />
    </svg>
  )
}

export function IconeEnvelopeEnviado(props) {
  return (
    <svg {...padrao} {...props}>
      <path d="M21.5 11.2V7.5a3 3 0 0 0-3-3h-13a3 3 0 0 0-3 3v9a3 3 0 0 0 3 3h7.3" />
      <path d="m3.2 8 7.6 5.1a2 2 0 0 0 2.4 0L20.8 8" />
      <path d="m16.5 19.2 2 2 4-4.4" />
    </svg>
  )
}

export function IconeAlerta(props) {
  return (
    <svg {...padrao} width={18} height={18} {...props}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7.6v5" />
      <circle cx="12" cy="16.2" r="1" fill="currentColor" stroke="none" />
    </svg>
  )
}
