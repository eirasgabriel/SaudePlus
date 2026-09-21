import { NavLink, Outlet } from "react-router-dom";
import Icone from "../components/Icone";
import Avatar from "../components/Avatar";
import { itensMenu, itensTopo, usuarioLogado } from "../services/dadosAdminNavegacao";
import estilos from "./AdminLayout.module.css";

/**
 * Casca da área administrativa: cabeçalho + menu lateral + <Outlet />.
 * Cada página é renderizada no lugar do Outlet pelas rotas filhas.
 */
export default function AdminLayout({ usuario = usuarioLogado }) {
  /* `end` só no Dashboard, senão "/admin" ficaria ativo em todas as rotas filhas */
  const classeTopo = ({ isActive }) =>
    `${estilos.navItem} ${isActive ? estilos.navAtivo : ""}`;

  const classeLateral = ({ isActive }) =>
    `${estilos.menuItem} ${isActive ? estilos.menuAtivo : ""}`;

  /* A div `.app` carrega o reset da área administrativa, escopado
     para não afetar as telas do paciente. */
  return (
    <div className={estilos.app}>
      <header className={estilos.topbar}>
        <NavLink to="/admin" className={estilos.marca} aria-label="SaúdePlus — início">
          <span className={estilos.marcaNome}>
            <span>Saúde</span>
            <span>Plus</span>
          </span>
          <span className={estilos.marcaSlogan}>
            A sua saúde, sempre andando junto com você!
          </span>
        </NavLink>

        <nav className={estilos.nav} aria-label="Navegação principal">
          {itensTopo.map((item) => (
            <NavLink
              key={item.id}
              to={item.para}
              end={item.para === "/admin"}
              className={classeTopo}
            >
              <Icone nome={item.icone} tam={17} />
              {item.rotulo}
            </NavLink>
          ))}
        </nav>

        <div className={estilos.acoes}>
          <button type="button" className={estilos.iconeBtn} aria-label="Buscar">
            <Icone nome="busca" tam={20} />
          </button>

          <button
            type="button"
            className={estilos.iconeBtn}
            aria-label={`Notificações: ${usuario.naoLidas} não lidas`}
          >
            <Icone nome="sino" tam={20} />
            {usuario.naoLidas > 0 && (
              <span className={estilos.badge}>{usuario.naoLidas}</span>
            )}
          </button>

          <button type="button" className={estilos.perfil}>
            <Avatar nome={usuario.nome} foto={usuario.foto} cor="var(--azul)" tam={40} />
            <span className={estilos.perfilTexto}>
              <span className={estilos.perfilNome}>{usuario.nome}</span>
              <span className={estilos.perfilCargo}>{usuario.cargo}</span>
            </span>
            <Icone nome="chevronBaixo" tam={17} className={estilos.chevron} />
          </button>
        </div>
      </header>

      <div className={estilos.corpo}>
        <aside className={estilos.sidebar}>
          <nav className={estilos.menu} aria-label="Menu administrativo">
            {itensMenu.map((item) => (
              <NavLink
                key={item.id}
                to={item.para}
                end={item.para === "/admin"}
                className={classeLateral}
                title={item.rotulo}
              >
                <Icone nome={item.icone} tam={20} />
                <span className={estilos.menuRotulo}>{item.rotulo}</span>
              </NavLink>
            ))}
          </nav>

          <div className={estilos.promo}>
            <svg
              className={estilos.promoOnda}
              viewBox="0 0 220 90"
              preserveAspectRatio="none"
              height="90"
              fill="none"
              aria-hidden="true"
            >
              <path
                d="M0 42c34-22 62 12 96-4s58-26 124-10v62H0z"
                fill="#ffffff"
                opacity=".55"
              />
              <path
                d="M0 62c40-18 66 8 102-6s62-18 118-2v46H0z"
                fill="#ffffff"
                opacity=".45"
              />
            </svg>

            <div className={estilos.promoIcone}>
              <Icone nome="escudo" tam={23} />
            </div>
            <p className={estilos.promoTexto}>
              Juntos por
              <br />
              uma saúde melhor
              <br />
              em Saquarema!
            </p>
            <Icone nome="coracao" tam={32} className={estilos.promoCoracao} />
          </div>
        </aside>

        <main className={estilos.conteudo}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
