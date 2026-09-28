import { useEffect, useId, useRef, useState } from "react";

import { cx } from "../../../utils/cx.js";
import { SearchIcon, ChevronDownIcon } from "../../../components/icons/Icons.jsx";
import { BellIcon } from "../components/icons/MedicoIcons.jsx";
import MenuPerfil from "../components/MenuPerfil/MenuPerfil.jsx";
import { irAtePainel } from "../foco.js";
import { iniciais } from "../selectors.js";
import LinkDestino from "../navegacao/LinkDestino.jsx";
import { useNavegacao } from "../navegacao/useNavegacao.js";
import DashboardBrand from "./DashboardBrand.jsx";
import { MENU_TOPO } from "./navigation.js";
import styles from "./DashboardHeader.module.css";

/**
 * Cabeçalho do painel do médico.
 *
 * O que já funciona hoje:
 * - a busca abre, fecha com Esc e devolve o foco ao botão de origem;
 * - o sino leva até o painel de Notificações da própria tela;
 * - o avatar abre o menu da conta.
 *
 * O que está reservado (abre o aviso de "em breve" dizendo o destino):
 * - os itens do menu superior;
 * - a marca, que levará ao início do painel;
 * - o envio da busca;
 * - os itens de dentro do menu da conta.
 */
export default function DashboardHeader({ medico, totalNotificacoes = 0, idPainelNotificacoes }) {
  const [buscaAberta, setBuscaAberta] = useState(false);
  const [perfilAberto, setPerfilAberto] = useState(false);
  const [termo, setTermo] = useState("");

  const botaoBusca = useRef(null);
  const campoBusca = useRef(null);
  const botaoPerfil = useRef(null);

  const idMenuPerfil = `${useId().replace(/[^a-zA-Z0-9_-]/g, "")}-menu-perfil`;
  const { irPara } = useNavegacao();

  useEffect(() => {
    if (!buscaAberta) return undefined;
    campoBusca.current?.focus();

    const aoTeclar = (evento) => {
      if (evento.key !== "Escape") return;
      setBuscaAberta(false);
      botaoBusca.current?.focus();
    };

    document.addEventListener("keydown", aoTeclar);
    return () => document.removeEventListener("keydown", aoTeclar);
  }, [buscaAberta]);

  const enviarBusca = (evento) => {
    evento.preventDefault();
    const busca = termo.trim();
    setBuscaAberta(false);
    botaoBusca.current?.focus();

    /* A tela de resultados ainda não existe, então o termo vai para o aviso.
       ATIVAR ROTAS: `irPara` passa a navegar para /medico/busca sozinho — e
       aqui basta acrescentar o termo como parâmetro de busca:
         irPara("busca", { parametros: { q: busca } })
       lembrando de trocar `caminhoDe` para montar a query string. */
    irPara("busca", { detalhe: busca ? `Busca por “${busca}”` : "Busca sem termo" });
  };

  /* Atalho real: em vez de um destino que não existe, o sino leva até as
     notificações que já estão na tela, rolando e movendo o foco para lá. */
  const abrirNotificacoes = () => {
    setPerfilAberto(false);
    if (idPainelNotificacoes) {
      irAtePainel(idPainelNotificacoes);
      return;
    }
    irPara("notificacoes");
  };

  const contador = totalNotificacoes > 9 ? "9+" : String(totalNotificacoes);

  return (
    <header className={styles.cabecalho}>
      <div className={styles.barra}>
        <DashboardBrand />

        <nav className={styles.menu} aria-label="Principal">
          {MENU_TOPO.map(({ rotulo, icone: Icone, destino, ativo }) => (
            /* ATIVAR ROTAS (passo 4): LinkDestino vira <NavLink>, e o `ativo`
               sai de navigation.js — quem marca a página atual passa a ser o
               `isActive` do próprio NavLink. */
            <LinkDestino
              key={rotulo}
              destino={destino}
              className={cx(styles.link, ativo && styles.ativo)}
              aria-current={ativo ? "page" : undefined}
              onClick={() => {
                setBuscaAberta(false);
                setPerfilAberto(false);
              }}
            >
              <Icone size={20} className={styles.linkIcone} />
              {rotulo}
            </LinkDestino>
          ))}
        </nav>

        <div className={styles.acoes}>
          <button
            type="button"
            ref={botaoBusca}
            className={styles.botaoIcone}
            aria-expanded={buscaAberta}
            aria-controls="busca-painel-medico"
            onClick={() => {
              setPerfilAberto(false);
              setBuscaAberta((aberta) => !aberta);
            }}
          >
            <SearchIcon size={22} />
            <span className="sr-only">Pesquisar</span>
          </button>

          <button
            type="button"
            className={styles.botaoIcone}
            aria-label={
              totalNotificacoes > 0
                ? `Notificações, ${totalNotificacoes} não lidas`
                : "Notificações"
            }
            onClick={abrirNotificacoes}
          >
            <BellIcon size={22} />
            {totalNotificacoes > 0 && (
              <span className={styles.contador} aria-hidden="true">
                {contador}
              </span>
            )}
          </button>

          <span className={styles.divisor} aria-hidden="true" />

          <div className={styles.perfilArea}>
            <button
              type="button"
              ref={botaoPerfil}
              className={styles.perfil}
              aria-haspopup="menu"
              aria-expanded={perfilAberto}
              aria-controls={idMenuPerfil}
              aria-label={`Menu da conta de ${medico.nome}`}
              onClick={() => {
                setBuscaAberta(false);
                setPerfilAberto((aberto) => !aberto);
              }}
            >
              <span className={styles.avatar} aria-hidden="true">
                {medico.avatarUrl ? <img src={medico.avatarUrl} alt="" /> : iniciais(medico.nome)}
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
            />
          </div>
        </div>
      </div>

      {buscaAberta && (
        <form id="busca-painel-medico" className={styles.busca} role="search" onSubmit={enviarBusca}>
          <label className="sr-only" htmlFor="busca-medico">
            Buscar paciente, consulta ou exame
          </label>
          <input
            id="busca-medico"
            ref={campoBusca}
            type="search"
            value={termo}
            onChange={(evento) => setTermo(evento.target.value)}
            placeholder="Busque por paciente, consulta ou exame"
          />
          <button type="submit" className={styles.buscaEnviar}>
            Buscar
          </button>
        </form>
      )}
    </header>
  );
}
