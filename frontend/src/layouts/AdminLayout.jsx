import { useId, useRef, useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import Icone from "../components/Icone";
import Avatar from "../components/Avatar";
import MenuPerfil from "../components/MenuPerfil/MenuPerfil.jsx";
import MenuNotificacoes from "../features/medico/layouts/MenuNotificacoes.jsx";
import { useAuth } from "../features/auth/auth.context.js";
import { useTema } from "../tema/contextoDoTema.js";
import { itemDoTema } from "../tema/itemDoTema.js";
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
/**
 * `notificacoesDoSino`: `{ lista, marcarUma, marcarTodas, aoMudar }`. Sem a
 * lista, o sino mostra só o contador de `usuario.naoLidas`.
 * `acessoClinica`: a mesma casca para a conta da unidade clínica (/clinica),
 * com menu próprio e sem o sino.
 */
export default function AdminLayout({
  usuario = usuarioLogado,
  modulos = null,
  contexto,
  notificacoesDoSino,
  acessoClinica = false,
}) {
  const inicio = acessoClinica ? '/clinica' : '/admin';
  const menuClinica = [
    { id: 'painel', rotulo: 'Minha unidade', icone: 'clinica', para: '/clinica' },
    { id: 'medicos', rotulo: 'Médicos', icone: 'estetoscopio', para: '/clinica/medicos' },
    { id: 'conta', rotulo: 'Minha conta', icone: 'usuario', para: '/clinica/conta' },
  ];
  const visivel = (item) => modulos == null || item.id === "suporte" || modulos.includes(item.modulo ?? item.id);

  /* Menu da conta, o mesmo componente do painel do médico. Antes o botão do
     nome no canto superior direito não abria nada — era um <button> sem ação,
     com uma seta que prometia um menu inexistente. */
  const [contaAberta, setContaAberta] = useState(false);
  const botaoConta = useRef(null);
  const idMenuConta = `${useId().replace(/[^a-zA-Z0-9_-]/g, "")}-menu-conta`;
  const navegar = useNavigate();

  /* Sino: o mesmo menu suspenso do painel do médico. Lidas nesta sessão somem
     do menu e do contador na hora, sem esperar a lista recarregar. */
  const [sinoAberto, setSinoAberto] = useState(false);
  const botaoSino = useRef(null);
  const idMenuNotificacoes = `${idMenuConta}-notificacoes`;
  const [lidasAgora, setLidasAgora] = useState(() => new Set());
  const listaDoSino = notificacoesDoSino?.lista;
  const naoLidas = listaDoSino?.filter(({ id, lida }) => !lida && !lidasAgora.has(id)) ?? null;
  const totalNaoLidas = naoLidas ? naoLidas.length : usuario.naoLidas;

  const { sair } = useAuth();
  const { tema, alternarTema } = useTema();

  const iconeDoMenu = (nome) =>
    function IconeDoMenu({ size, className }) {
      return <Icone nome={nome} tam={size} className={className} />;
    };

  const itensDaConta = [
    { rotulo: "Minha conta", icone: iconeDoMenu("usuario"), href: acessoClinica ? '/clinica/conta' : '/admin/configuracoes' },
    { rotulo: "Ajuda", icone: iconeDoMenu("interrogacao"), href: "/ajuda" },
    itemDoTema(tema, alternarTema),
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
        <NavLink to={inicio} className={estilos.marca} aria-label="SaúdePlus — início">
          <span className={estilos.marcaNome}>
            <span>Saúde</span>
            <span>Plus</span>
          </span>
          <span className={estilos.marcaSlogan}>
            A sua saúde, sempre andando junto com você!
          </span>
        </NavLink>

        <nav className={estilos.nav} aria-label="Navegação principal">
          {(acessoClinica ? menuClinica : itensTopo.filter(visivel)).map((item) => (
            <NavLink
              key={item.id}
              to={item.para}
              end={item.para === inicio}
              className={classeTopo}
            >
              <Icone nome={item.icone} tam={17} />
              {item.rotulo}
            </NavLink>
          ))}
        </nav>

        <div className={estilos.acoes}>
          {!acessoClinica && <button type="button" className={estilos.iconeBtn} aria-label="Buscar">
            <Icone nome="busca" tam={20} />
          </button>}

          {!acessoClinica && (
            <div className={estilos.ancora}>
              <button
                type="button"
                ref={botaoSino}
                className={estilos.iconeBtn}
                aria-haspopup="true"
                aria-expanded={sinoAberto}
                aria-controls={idMenuNotificacoes}
                aria-label={totalNaoLidas > 0 ? `Notificações, ${totalNaoLidas} não lidas` : "Notificações"}
                onClick={() => {
                  setContaAberta(false);
                  setSinoAberto((aberto) => !aberto);
                }}
              >
                <Icone nome="sino" tam={20} />
                {totalNaoLidas > 0 && (
                  <span className={estilos.badge} aria-hidden="true">
                    {totalNaoLidas > 9 ? "9+" : totalNaoLidas}
                  </span>
                )}
              </button>

              <MenuNotificacoes
                id={idMenuNotificacoes}
                aberto={sinoAberto}
                aoFechar={() => setSinoAberto(false)}
                botaoDeOrigem={botaoSino}
                naoLidas={naoLidas}
                aoMarcarComoLidas={(ids) => setLidasAgora((anteriores) => new Set([...anteriores, ...ids]))}
                aoVerTodas={() => {
                  setSinoAberto(false);
                  navegar("/admin/notificacoes");
                }}
                marcarUma={notificacoesDoSino?.marcarUma}
                marcarTodas={notificacoesDoSino?.marcarTodas}
                aoSincronizar={notificacoesDoSino?.aoMudar}
              />
            </div>
          )}

          <div className={estilos.perfilCaixa}>
            <button
              type="button"
              ref={botaoConta}
              className={estilos.perfil}
              aria-haspopup="menu"
              aria-expanded={contaAberta}
              aria-controls={idMenuConta}
              aria-label={`Menu da conta de ${usuario.nome}`}
              onClick={() => {
                setSinoAberto(false);
                setContaAberta((aberta) => !aberta);
              }}
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
            {(acessoClinica ? menuClinica : itensMenu.filter(visivel)).map((item) => (
              <NavLink
                key={item.id}
                to={item.para}
                end={item.para === inicio}
                className={classeLateral}
                title={item.rotulo}
              >
                <Icone nome={item.icone} tam={20} />
                <span className={estilos.menuRotulo}>{item.rotulo}</span>
              </NavLink>
            ))}
          </nav>

          {/* Mensagem no pé do menu, no mesmo formato do painel do médico. */}
          <div className={estilos.promo}>
            <Icone nome="escudo" tam={24} className={estilos.promoIcone} />
            <p className={estilos.promoTexto}>Juntos por uma saúde melhor em Saquarema!</p>
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
