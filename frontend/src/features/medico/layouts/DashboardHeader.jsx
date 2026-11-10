import { useEffect, useId, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import { cx } from "../../../utils/cx.js";
import { enderecoDaApi } from "../../../services/http.js";
import { SearchIcon, ChevronDownIcon } from "../../../components/icons/Icons.jsx";
import { BellIcon, MoonIcon, SunIcon } from "../components/icons/MedicoIcons.jsx";
import MenuPerfil from "../../../components/MenuPerfil/MenuPerfil.jsx";
import { iniciais } from "../selectors.js";
import { useNavegacao } from "../navegacao/useNavegacao.js";
import DashboardBrand from "./DashboardBrand.jsx";
import MenuNotificacoes from "./MenuNotificacoes.jsx";
import { MENU_PERFIL } from "./navigation.js";
import { caminhoDe } from "../rotas.js";
import styles from "./DashboardHeader.module.css";

/**
 * Cabeçalho do painel do médico, na casca marinho: marca, busca recolhível,
 * notificações e conta. A navegação entre telas fica só na barra lateral.
 *
 * - a lupa abre um campo branco que cresce para a esquerda; clicar fora ou
 *   Esc recolhe. A busca procura pacientes pelo nome (/medico/busca?q=);
 * - o sino abre um menu com as notificações não lidas;
 * - o nome abre o menu da conta (Minha conta, Ajuda, Modo escuro, Sair).
 *
 * `notificacoes`: a lista completa (lidas e não lidas). Sem ela, o sino usa
 * só `totalNotificacoes` para o contador.
 */
export default function DashboardHeader({
  medico,
  notificacoes,
  totalNotificacoes = 0,
  tema = "claro",
  aoAlternarTema,
}) {
  const [perfilAberto, setPerfilAberto] = useState(false);
  const [notificacoesAberto, setNotificacoesAberto] = useState(false);
  const [termo, setTermo] = useState("");
  const [buscaAberta, setBuscaAberta] = useState(false);
  const areaBusca = useRef(null);
  const campoBusca = useRef(null);
  /* Lidas nesta sessão: somem do menu e do contador na hora, sem esperar
     a tela recarregar a lista. */
  const [lidasAgora, setLidasAgora] = useState(() => new Set());

  const botaoPerfil = useRef(null);
  const botaoSino = useRef(null);

  const prefixo = useId().replace(/[^a-zA-Z0-9_-]/g, "");
  const idMenuPerfil = `${prefixo}-menu-perfil`;
  const idMenuNotificacoes = `${prefixo}-menu-notificacoes`;
  const idBusca = `${prefixo}-busca`;

  const { irPara } = useNavegacao();
  const navegar = useNavigate();

  const naoLidas = notificacoes?.filter(({ id, lida }) => !lida && !lidasAgora.has(id)) ?? null;
  const total = naoLidas ? naoLidas.length : totalNotificacoes;
  const contador = total > 9 ? "9+" : String(total);

  const marcarComoLidas = (ids) =>
    setLidasAgora((anteriores) => new Set([...anteriores, ...ids]));

  const escuro = tema === "escuro";
  const itemDoTema = aoAlternarTema && {
    rotulo: "Modo escuro",
    icone: escuro ? MoonIcon : SunIcon,
    alternar: { ligado: escuro, aoAlternar: aoAlternarTema },
  };

  const itensDeNavegacao = MENU_PERFIL.map(({ rotulo, icone, destino, separado }) => ({
    rotulo,
    icone,
    separado,
    href: caminhoDe(destino),
    destaque: destino === "sair",
    onSelecionar: (evento) => {
      evento.preventDefault();
      irPara(destino);
    },
  }));
  /* O tema fica antes do "Sair", junto das preferências da conta. */
  const itensDaConta = itemDoTema
    ? [...itensDeNavegacao.slice(0, -1), itemDoTema, itensDeNavegacao.at(-1)]
    : itensDeNavegacao;

  /* Aberta, a busca escuta cliques fora e o Esc para se recolher. */
  useEffect(() => {
    if (!buscaAberta) return undefined;
    campoBusca.current?.focus();
    const aoClicarFora = (evento) => {
      if (!areaBusca.current?.contains(evento.target)) setBuscaAberta(false);
    };
    const aoTeclar = (evento) => {
      if (evento.key === "Escape") setBuscaAberta(false);
    };
    document.addEventListener("mousedown", aoClicarFora);
    document.addEventListener("keydown", aoTeclar);
    return () => {
      document.removeEventListener("mousedown", aoClicarFora);
      document.removeEventListener("keydown", aoTeclar);
    };
  }, [buscaAberta]);

  const enviarBusca = (evento) => {
    evento.preventDefault();
    // Primeiro clique na lupa só abre o campo.
    if (!buscaAberta) {
      setBuscaAberta(true);
      return;
    }
    const busca = termo.trim();
    if (!busca) {
      campoBusca.current?.focus();
      return;
    }
    // A busca procura pacientes do médico pelo nome (GET /api/medico/pacientes?q=).
    setBuscaAberta(false);
    navegar(`${caminhoDe("busca")}?q=${encodeURIComponent(busca)}`);
  };

  return (
    <header className={styles.cabecalho}>
      <div className={styles.barra}>
        <DashboardBrand />

        <div className={styles.acoes}>
          <form
            ref={areaBusca}
            className={cx(styles.busca, buscaAberta && styles.buscaAberta)}
            role="search"
            onSubmit={enviarBusca}
          >
            <label className="sr-only" htmlFor={idBusca}>
              Buscar paciente pelo nome
            </label>
            <input
              id={idBusca}
              ref={campoBusca}
              className={styles.buscaCampo}
              type="search"
              value={termo}
              onChange={(evento) => setTermo(evento.target.value)}
              placeholder="Buscar paciente pelo nome"
              autoComplete="off"
              tabIndex={buscaAberta ? 0 : -1}
              aria-hidden={!buscaAberta}
            />
            <button
              type="submit"
              className={styles.botaoIcone}
              aria-label={buscaAberta ? "Buscar" : "Abrir busca de pacientes"}
              aria-expanded={buscaAberta}
              aria-controls={idBusca}
            >
              <SearchIcon size={22} />
            </button>
          </form>

          <div className={styles.ancora}>
            <button
              type="button"
              ref={botaoSino}
              className={styles.botaoIcone}
              aria-haspopup="true"
              aria-expanded={notificacoesAberto}
              aria-controls={idMenuNotificacoes}
              aria-label={total > 0 ? `Notificações, ${total} não lidas` : "Notificações"}
              onClick={() => {
                setPerfilAberto(false);
                setNotificacoesAberto((aberto) => !aberto);
              }}
            >
              <BellIcon size={22} />
              {total > 0 && (
                <span className={styles.contador} aria-hidden="true">
                  {contador}
                </span>
              )}
            </button>

            <MenuNotificacoes
              id={idMenuNotificacoes}
              aberto={notificacoesAberto}
              aoFechar={() => setNotificacoesAberto(false)}
              botaoDeOrigem={botaoSino}
              naoLidas={naoLidas}
              aoMarcarComoLidas={marcarComoLidas}
              aoVerTodas={() => {
                setNotificacoesAberto(false);
                irPara("notificacoes");
              }}
            />
          </div>

          <span className={styles.divisor} aria-hidden="true" />

          <div className={styles.ancora}>
            <button
              type="button"
              ref={botaoPerfil}
              className={styles.perfil}
              aria-haspopup="menu"
              aria-expanded={perfilAberto}
              aria-controls={idMenuPerfil}
              aria-label={`Menu da conta de ${medico.nome}`}
              onClick={() => {
                setNotificacoesAberto(false);
                setPerfilAberto((aberto) => !aberto);
              }}
            >
              <span className={styles.avatar} aria-hidden="true">
                {medico.avatarUrl ? <img src={enderecoDaApi(medico.avatarUrl)} alt="" /> : iniciais(medico.nome)}
              </span>
              <span className={styles.perfilTexto} aria-hidden="true">
                <span className={styles.perfilNome}>{medico.nome}</span>
                <span className={styles.perfilPapel}>{medico.perfil}</span>
              </span>
              <ChevronDownIcon
                size={18}
                className={cx(styles.perfilSeta, perfilAberto && styles.perfilSetaAberta)}
              />
            </button>

            <MenuPerfil
              id={idMenuPerfil}
              aberto={perfilAberto}
              aoFechar={() => setPerfilAberto(false)}
              botaoDeOrigem={botaoPerfil}
              itens={itensDaConta}
            />
          </div>
        </div>
      </div>
    </header>
  );
}
