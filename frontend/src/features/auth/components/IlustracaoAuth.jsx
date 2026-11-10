/**
 * Ilustração decorativa da casca azul das telas de autenticação:
 * calendário com check, cruz, coração com batimento e estetoscópio.
 * Puramente decorativa (aria-hidden), em SVG inline para não pesar o bundle.
 */
export default function IlustracaoAuth({ className }) {
  return (
    <svg
      className={className}
      viewBox="0 0 640 560"
      fill="none"
      aria-hidden="true"
      focusable="false"
      preserveAspectRatio="xMidYMid meet"
    >
      <defs>
        <linearGradient id="ia-cal" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#9CC4FF" />
          <stop offset="1" stopColor="#4F8EF7" />
        </linearGradient>
        <linearGradient id="ia-cal-topo" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#7DB0FF" />
          <stop offset="1" stopColor="#3D7FF0" />
        </linearGradient>
        <linearGradient id="ia-cruz" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#4C8DF8" />
          <stop offset="1" stopColor="#2E6FE6" />
        </linearGradient>
        <linearGradient id="ia-coracao" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#5C9DFF" />
          <stop offset="1" stopColor="#1F5FD9" />
        </linearGradient>
        <linearGradient id="ia-check" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#2F7BF5" />
          <stop offset="1" stopColor="#1250C8" />
        </linearGradient>
        <linearGradient id="ia-tubo" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#3C7BEB" />
          <stop offset="1" stopColor="#1E5BD6" />
        </linearGradient>
        <radialGradient id="ia-metal" cx="0.4" cy="0.35" r="0.7">
          <stop offset="0" stopColor="#F4F8FF" />
          <stop offset="0.55" stopColor="#B9CCEB" />
          <stop offset="1" stopColor="#6E8CC0" />
        </radialGradient>
        <filter id="ia-sombra" x="-20%" y="-20%" width="140%" height="150%">
          <feDropShadow dx="0" dy="18" stdDeviation="18" floodColor="#031E6E" floodOpacity="0.35" />
        </filter>
      </defs>

      {/* Cruz ao fundo */}
      <g opacity="0.85" filter="url(#ia-sombra)">
        <path
          d="M392 40h56a12 12 0 0 1 12 12v48h48a12 12 0 0 1 12 12v56a12 12 0 0 1-12 12h-48v48a12 12 0 0 1-12 12h-56a12 12 0 0 1-12-12v-48h-48a12 12 0 0 1-12-12v-56a12 12 0 0 1 12-12h48V52a12 12 0 0 1 12-12Z"
          fill="url(#ia-cruz)"
        />
      </g>

      {/* Calendário */}
      <g filter="url(#ia-sombra)" transform="rotate(-6 210 290)">
        <rect x="70" y="150" width="300" height="290" rx="34" fill="#3A78E8" />
        <rect x="80" y="140" width="300" height="290" rx="34" fill="url(#ia-cal)" />
        <path d="M80 190a50 50 0 0 1 50-50h200a50 50 0 0 1 50 50v14H80Z" fill="url(#ia-cal-topo)" />
        {[0, 1, 2, 3].map((c) => (
          <rect key={`a${c}`} x={112 + c * 64} y={232} width="46" height="40" rx="10" fill="#5B95F2" opacity="0.75" />
        ))}
        {[0, 1, 2].map((c) => (
          <rect key={`b${c}`} x={112 + c * 64} y={290} width="46" height="40" rx="10" fill="#5B95F2" opacity="0.75" />
        ))}
        {[0, 1].map((c) => (
          <rect key={`c${c}`} x={112 + c * 64} y={348} width="46" height="40" rx="10" fill="#5B95F2" opacity="0.6" />
        ))}
        {/* argolas */}
        <rect x="150" y="104" width="20" height="62" rx="10" fill="#DCE8FF" stroke="#7AA6F0" strokeWidth="4" />
        <rect x="290" y="104" width="20" height="62" rx="10" fill="#DCE8FF" stroke="#7AA6F0" strokeWidth="4" />
        {/* selo de check */}
        <circle cx="318" cy="366" r="52" fill="url(#ia-check)" stroke="#8DB8FF" strokeWidth="4" />
        <path d="m294 366 17 17 32-34" stroke="#fff" strokeWidth="13" strokeLinecap="round" strokeLinejoin="round" />
      </g>

      {/* Coração com batimento */}
      <g filter="url(#ia-sombra)">
        <path
          d="M500 412c-6 0-82-50-96-98-9-31 10-62 42-64 22-1 38 12 54 32 16-20 32-33 54-32 32 2 51 33 42 64-14 48-90 98-96 98Z"
          fill="url(#ia-coracao)"
        />
        <path
          d="M420 318h38l12-22 16 48 16-62 14 52 10-16h44"
          stroke="#E6F1FF"
          strokeWidth="6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>

      {/* Estetoscópio */}
      <g filter="url(#ia-sombra)">
        <path
          d="M110 382c-60 0-92 34-80 70 14 42 82 54 150 40 52-11 92-38 140-24 40 12 58 30 72 36"
          stroke="url(#ia-tubo)"
          strokeWidth="16"
          strokeLinecap="round"
        />
        <path
          d="M110 382c40-2 72 22 82 54"
          stroke="#E2ECFF"
          strokeWidth="9"
          strokeLinecap="round"
          opacity="0.9"
        />
        <rect x="88" y="370" width="38" height="24" rx="12" fill="#1F5BD6" />
        <rect x="58" y="380" width="30" height="22" rx="11" fill="#1F5BD6" />
        <circle cx="430" cy="514" r="40" fill="url(#ia-metal)" />
        <circle cx="430" cy="514" r="26" fill="#9FB7DE" stroke="#E8F0FF" strokeWidth="4" />
        <circle cx="430" cy="514" r="5" fill="#4C6FA8" />
      </g>
    </svg>
  )
}
