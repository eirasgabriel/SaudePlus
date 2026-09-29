/* Ícones exclusivos do painel do médico.
   Os demais vêm de `src/components/icons/Icons.jsx`, que não é alterado aqui.
   Mesmo contrato dos ícones do sistema: herdam a cor via `currentColor`
   e aceitam `size` e qualquer prop de SVG. */

const base = (size, { style, ...rest }) => ({
  width: size,
  height: size,
  "aria-hidden": true,
  focusable: "false",
  style: { display: "block", flexShrink: 0, ...style },
  ...rest,
});

const traco = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: "1.9",
  strokeLinecap: "round",
  strokeLinejoin: "round",
};

export function HomeIcon({ size = 22, ...props }) {
  return (
    <svg {...traco} {...base(size, props)}>
      <path d="M3.5 10.4 12 3.5l8.5 6.9V20a1.5 1.5 0 0 1-1.5 1.5h-3.8v-6.1H8.8v6.1H5A1.5 1.5 0 0 1 3.5 20z" />
    </svg>
  );
}

export function FlaskIcon({ size = 22, ...props }) {
  return (
    <svg {...traco} {...base(size, props)}>
      <path d="M9.5 2.8h5M10 2.8v6.5L4.7 19.2a1.4 1.4 0 0 0 1.2 2.1h12.2a1.4 1.4 0 0 0 1.2-2.1L14 9.3V2.8" />
      <path d="M7.2 15h9.6" />
    </svg>
  );
}

export function BellIcon({ size = 22, ...props }) {
  return (
    <svg {...traco} {...base(size, props)}>
      <path d="M6.2 9a5.8 5.8 0 0 1 11.6 0c0 6.2 2.4 8.2 2.4 8.2H3.8S6.2 15.2 6.2 9" />
      <path d="M10.2 20.6a2 2 0 0 0 3.6 0" />
    </svg>
  );
}

export function ClipboardIcon({ size = 22, ...props }) {
  return (
    <svg {...traco} {...base(size, props)}>
      <path d="M9 4.2H7.2a1.7 1.7 0 0 0-1.7 1.7v13.6a1.7 1.7 0 0 0 1.7 1.7h9.6a1.7 1.7 0 0 0 1.7-1.7V5.9a1.7 1.7 0 0 0-1.7-1.7H15" />
      <rect x="9" y="2.5" width="6" height="3.4" rx="1.1" />
    </svg>
  );
}

export function DotIcon({ size = 22, ...props }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...base(size, props)}>
      <circle cx="12" cy="12" r="5" />
    </svg>
  );
}

export function GearIcon({ size = 22, ...props }) {
  return (
    <svg {...traco} {...base(size, props)}>
      <circle cx="12" cy="12" r="3.2" />
      <path d="M19.5 14.2a1.6 1.6 0 0 0 .3 1.8l.1.1a1.9 1.9 0 1 1-2.7 2.7l-.1-.1a1.6 1.6 0 0 0-1.8-.3 1.6 1.6 0 0 0-1 1.5v.2a1.9 1.9 0 0 1-3.8 0v-.1a1.6 1.6 0 0 0-1-1.5 1.6 1.6 0 0 0-1.8.3l-.1.1a1.9 1.9 0 1 1-2.7-2.7l.1-.1a1.6 1.6 0 0 0 .3-1.8 1.6 1.6 0 0 0-1.5-1h-.2a1.9 1.9 0 0 1 0-3.8h.1a1.6 1.6 0 0 0 1.5-1 1.6 1.6 0 0 0-.3-1.8l-.1-.1a1.9 1.9 0 1 1 2.7-2.7l.1.1a1.6 1.6 0 0 0 1.8.3h.1a1.6 1.6 0 0 0 1-1.5v-.2a1.9 1.9 0 0 1 3.8 0v.1a1.6 1.6 0 0 0 1 1.5 1.6 1.6 0 0 0 1.8-.3l.1-.1a1.9 1.9 0 1 1 2.7 2.7l-.1.1a1.6 1.6 0 0 0-.3 1.8v.1a1.6 1.6 0 0 0 1.5 1h.2a1.9 1.9 0 0 1 0 3.8h-.1a1.6 1.6 0 0 0-1.5 1z" />
    </svg>
  );
}

export function LogoutIcon({ size = 22, ...props }) {
  return (
    <svg {...traco} {...base(size, props)}>
      <path d="M9.5 21.2H5.8a1.9 1.9 0 0 1-1.9-1.9V4.7a1.9 1.9 0 0 1 1.9-1.9h3.7" />
      <path d="M15.8 17.1 20.1 12l-4.3-5.1M20.1 12H9.5" />
    </svg>
  );
}

/* O QuestionCircleIcon do sistema é preenchido e traz o "?" numa cor fixa —
   foi desenhado para aparecer grande sobre fundo claro. No menu da conta, a
   18px, ele vira um círculo sólido. Este aqui é de traço, como os vizinhos. */
export function HelpIcon({ size = 22, ...props }) {
  return (
    <svg {...traco} {...base(size, props)}>
      <circle cx="12" cy="12" r="9.3" />
      <path d="M9.4 9.3a2.7 2.7 0 1 1 3.8 2.5c-.8.4-1.2 1-1.2 1.8v.5" />
      <path d="M12 17.4h.01" />
    </svg>
  );
}
