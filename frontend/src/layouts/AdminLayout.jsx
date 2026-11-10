import { useId, useRef, useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import Icone from "../components/Icone";
import Avatar from "../components/Avatar";
import MenuPerfil from "../components/MenuPerfil/MenuPerfil.jsx";
import { useAuth } from "../features/auth/auth.context.js";
import { itensMenu, itensTopo, usuarioLogado } from "../services/dadosAdminNavegacao";
import estilos from "./AdminLayout.module.css";

/**
 * Casca da área administrativa: cabeçalho + menu lateral + <Outlet />.
 * Cada página é renderizada no lugar do Outlet pelas rotas filhas.
 */
/**
 * `contexto`: repassado às páginas pelo `<Outlet context>`.
 * `modulos`: ids liberados para quem está logado (ex.: ["dashboard", "agendamentos"]).
 * Sem a lista (mocks), o menu mostra tudo. "Suporte" não é módulo e aparece sempre;
 * um item com `modulo` (ex.: Exames) segue o módulo que o protege.
 */
export default function AdminLayout({ usuario = usuarioLogado, modulos = null, contexto }) {
  const visivel = (item) => modulos == null || item.id === "suporte" || modulos.includes(item.modulo ?? item.id);

  /* Menu da conta, o mesmo componente do painel do médico. Antes o botão do
     nome no canto superior direito não abria nada — era um <button> sem ação,
     com uma seta que prometia um menu inexistente. */
  const [contaAberta, setContaAberta] = useState(false);
  const botaoConta = useRef(null);
  const idMenuConta = `${useId().replace(/[^a-zA-Z0-9_-]/g, "")}-menu-conta`;
  const navegar = useNavigate();
  const { sair } = useAuth();

  const iconeDoMenu = (nome) =>
    function IconeDoMenu({ size, className }) {
      return <Icone nome={nome} tam={size} className={className} />;
    };

  const itensDaConta = [
    { rotulo: "Minha conta", icone: iconeDoMenu("usuario"), href: "/admin/configuracoes" },
    { rotulo: "Ajuda", icone: iconeDoMenu("interrogacao"), href: "/ajuda" },
    {
      rotulo: "Sair",
      icone: iconeDoMenu("cadeadoAberto"),
      href: "/login",
      separado: true,
      destaque: true,
      /* Encerrar a sessão antes de navegar: com o token ainda válido, o
         RotaProtegida devolveria a pessoa para o painel. */
      onSelecionar: (evento) => {
        evento.preventDefault();
        sair();
        navegar("/login", { replace: true });
      },
    },
  ];
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
          {itensTopo.filter(visivel).map((item) => (
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
            onClick={() => navegar("/admin/notificacoes")}
          >
            <Icone nome="sino" tam={20} />
            {usuario.naoLidas > 0 && (
              <span className={estilos.badge}>{usuario.naoLidas}</span>
            )}
          </button>

          <div className={estilos.perfilCaixa}>
            <button
              type="button"
              ref={botaoConta}
              className={estilos.perfil}
              aria-haspopup="menu"
              aria-expanded={contaAberta}
              aria-controls={idMenuConta}
              aria-label={`Menu da conta de ${usuario.nome}`}
              onClick={() => setContaAberta((aberta) => !aberta)}
            >
            <Avatar nome={usuario.nome} foto={usuario.foto} cor="var(--azul)" tam={40} />
            <span className={estilos.perfilTexto}>
              <span className={estilos.perfilNome}>{usuario.nome}</span>
              <span className={estilos.perfilCargo}>{usuario.cargo}</span>
            </span>
              <Icone nome="chevronBaixo" tam={17} className={estilos.chevron} />
            </button>

            <MenuPerfil
              id={idMenuConta}
              aberto={contaAberta}
              aoFechar={() => setContaAberta(false)}
              botaoDeOrigem={botaoConta}
              itens={itensDaConta}
            />
          </div>
        </div>
      </header>

      <div className={estilos.corpo}>
        <aside className={estilos.sidebar}>
          <nav className={estilos.menu} aria-label="Menu administrativo">
            {itensMenu.filter(visivel).map((item) => (
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
          {/* `contexto` chega às páginas por useOutletContext (ex.: reler o contador do sino). */}
          <Outlet context={contexto} />
        </main>
      </div>
    </div>
  );
}
