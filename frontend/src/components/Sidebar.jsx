import { NavLink } from 'react-router-dom';
import estilos from './Sidebar.module.css';

const classes = (...lista) => lista.filter(Boolean).join(' ');

/**
 * Itens do menu do paciente.
 *
 * `para` é a rota do react-router-dom. Um item sem `para` ainda não tem tela e
 * vira âncora inerte; quando a rota existir, basta preencher o campo.
 */
export const MENU_PACIENTE = [
  { rotulo: 'Visão geral', icone: 'inicio', para: '/paciente' },
  { rotulo: 'Minhas informações', icone: 'usuario', para: '/paciente/perfil' },
];

const propsSvg = {
  viewBox: '0 0 24 24',
  strokeWidth: 1.8,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  'aria-hidden': true,
  focusable: 'false',
};

const FORMAS = {
  inicio: <path d="M3 10.2 12 3l9 7.2V20a1.5 1.5 0 0 1-1.5 1.5H15v-6.5H9v6.5H4.5A1.5 1.5 0 0 1 3 20z" />,
  usuario: (
    <>
      <circle cx="12" cy="7.5" r="4.5" />
      <path d="M4 21.5v-1.5a5.5 5.5 0 0 1 5.5-5.5h5a5.5 5.5 0 0 1 5.5 5.5v1.5" />
    </>
  ),
  calendario: (
    <>
      <rect x="3" y="4.5" width="18" height="17" rx="2.5" />
      <path d="M8 2.5v4M16 2.5v4M3 9.5h18" />
    </>
  ),
  frasco: (
    <>
      <path d="M9.5 2.5h5M10 2.5v6.6L4.6 19.4A1.4 1.4 0 0 0 5.9 21.5h12.2a1.4 1.4 0 0 0 1.3-2.1L14 9.1V2.5" />
      <path d="M7 15h10" />
    </>
  ),
  arquivo: (
    <>
      <path d="M14 2.5H6.5A2 2 0 0 0 4.5 4.5v15a2 2 0 0 0 2 2h11a2 2 0 0 0 2-2V8z" />
      <path d="M14 2.5V8h5.5M8.5 13h7M8.5 17h7M8.5 9h2" />
    </>
  ),
  hospital: (
    <>
      <path d="M6 21.5V4.5a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v17" />
      <path d="M6 9.5H4a1.5 1.5 0 0 0-1.5 1.5v9A1.5 1.5 0 0 0 4 21.5h16a1.5 1.5 0 0 0 1.5-1.5v-9A1.5 1.5 0 0 0 20 9.5h-2" />
      <path d="M12 5.5v4M10 7.5h4M10 13h.01M14 13h.01M10.5 21.5v-4h3v4" />
    </>
  ),
  coracao: (
    <path d="M12 20.5s-8.5-5.1-8.5-11.2A4.8 4.8 0 0 1 8.3 4.5c1.6 0 2.9.8 3.7 2 .8-1.2 2.1-2 3.7-2a4.8 4.8 0 0 1 4.8 4.8c0 6.1-8.5 11.2-8.5 11.2z" />
  ),
};

function Icone({ nome, preenchido = false, className }) {
  return (
    <svg
      {...propsSvg}
      className={className}
      fill={preenchido ? 'currentColor' : 'none'}
      stroke={preenchido ? 'none' : 'currentColor'}
    >
      {FORMAS[nome]}
    </svg>
  );
}

/**
 * Menu lateral da área do paciente.
 *
 * O item ativo sai do próprio NavLink: ele compara a rota atual com o `to` e
 * entrega `isActive`, o que dispensa ler useLocation e comparar strings na mão.
 * O `end` só vale para /paciente — sem ele, a raiz ficaria marcada como ativa
 * em todas as telas filhas, já que é prefixo de todas.
 */
export default function Sidebar({ itens = MENU_PACIENTE, className }) {
  return (
    <aside className={classes(estilos.menuLateral, className)} aria-label="Menu do paciente">
      <nav>
        <ul className={estilos.lista}>
          {itens.map((item) => (
            <li key={item.rotulo}>
              {item.para ? (
                <NavLink
                  to={item.para}
                  end={item.para === '/paciente'}
                  className={({ isActive }) => classes(estilos.link, isActive && estilos.ativo)}
                >
                  {({ isActive }) => (
                    <>
                      <Icone
                        nome={item.icone}
                        preenchido={isActive && item.icone === 'inicio'}
                        className={estilos.icone}
                      />
                      {item.rotulo}
                    </>
                  )}
                </NavLink>
              ) : (
                <a href="#" className={estilos.link}>
                  <Icone nome={item.icone} className={estilos.icone} />
                  {item.rotulo}
                </a>
              )}
            </li>
          ))}
        </ul>
      </nav>

      <div className={estilos.cardCuidado}>
        <Icone nome="coracao" className={estilos.iconeCuidado} />
        <p className={estilos.textoCuidado}>
          Cuidar de você
          <br />é a nossa prioridade!
        </p>
        <svg className={estilos.arteCuidado} viewBox="0 0 210 110" preserveAspectRatio="none" aria-hidden="true">
          <path d="M0 60 C 40 30, 80 90, 130 55 S 190 20, 210 35 V110 H0z" fill="#C9DEFF" opacity=".55" />
          <path d="M0 85 C 50 60, 100 105, 150 80 S 200 60, 210 70 V110 H0z" fill="#B7D3FF" opacity=".55" />
          <path
            d="M145 52c-4-7-15-6-15 3 0 8 15 17 15 17s15-9 15-17c0-9-11-10-15-3z"
            fill="none"
            stroke="#2F8BFF"
            strokeWidth="2.5"
            strokeLinejoin="round"
            transform="translate(-6 -8) scale(1.08)"
          />
        </svg>
      </div>
    </aside>
  );
}
