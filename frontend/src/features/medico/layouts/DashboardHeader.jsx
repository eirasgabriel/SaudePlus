import { useEffect, useRef, useState } from "react";

import { cx } from "../../../utils/cx.js";
import { SearchIcon, ChevronDownIcon } from "../../../components/icons/Icons.jsx";
import { BellIcon } from "../components/icons/MedicoIcons.jsx";
import { iniciais } from "../selectors.js";
import DashboardBrand from "./DashboardBrand.jsx";
import { MENU_TOPO } from "./navigation.js";
import styles from "./DashboardHeader.module.css";

/**
 * Cabeçalho do painel do médico.
 *
 * A busca abre um painel controlado por `aria-expanded`/`aria-controls`,
 * fecha com Esc e devolve o foco ao botão de origem — mesmo comportamento do
 * Header institucional, para que a área logada não tenha outra gramática.
 */
export default function DashboardHeader({ medico, totalNotificacoes = 0, onBuscar, onAbrirPerfil }) {
  const [buscaAberta, setBuscaAberta] = useState(false);
  const [termo, setTermo] = useState("");
  const botaoBusca = useRef(null);
  const campoBusca = useRef(null);

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
    onBuscar?.(termo.trim());
    setBuscaAberta(false);
    botaoBusca.current?.focus();
  };

  const contador = totalNotificacoes > 9 ? "9+" : String(totalNotificacoes);

  return (
    <header className={styles.cabecalho}>
      <div className={styles.barra}>
        <DashboardBrand />

        <nav className={styles.menu} aria-label="Principal">
          {MENU_TOPO.map(({ rotulo, icone: Icone, href, ativo }) => (
            <a
              key={rotulo}
              href={href}
              className={cx(styles.link, ativo && styles.ativo)}
              aria-current={ativo ? "page" : undefined}
            >
              <Icone size={20} className={styles.linkIcone} />
              {rotulo}
            </a>
          ))}
        </nav>

        <div className={styles.acoes}>
          <button
            type="button"
            ref={botaoBusca}
            className={styles.botaoIcone}
            aria-expanded={buscaAberta}
            aria-controls="busca-painel-medico"
            onClick={() => setBuscaAberta((aberta) => !aberta)}
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
          >
            <BellIcon size={22} />
            {totalNotificacoes > 0 && (
              <span className={styles.contador} aria-hidden="true">
                {contador}
              </span>
            )}
          </button>

          <span className={styles.divisor} aria-hidden="true" />

          <button
            type="button"
            className={styles.perfil}
            aria-haspopup="menu"
            aria-label={`Menu da conta de ${medico.nome}`}
            onClick={onAbrirPerfil}
          >
            <span className={styles.avatar} aria-hidden="true">
              {medico.avatarUrl ? <img src={medico.avatarUrl} alt="" /> : iniciais(medico.nome)}
            </span>
            <span className={styles.perfilTexto} aria-hidden="true">
              <span className={styles.perfilNome}>{medico.nome}</span>
              <span className={styles.perfilPapel}>{medico.perfil}</span>
            </span>
            <ChevronDownIcon size={18} className={styles.perfilSeta} />
          </button>
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
