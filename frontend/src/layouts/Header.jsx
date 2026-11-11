import { NavLink, useNavigate } from "react-router-dom";
import { useCallback, useEffect, useRef, useState } from "react";

import Logo from "../components/Logo/Logo.jsx";
import Button from "../components/Button/Button.jsx";
import { SearchIcon, MenuIcon } from "../components/icons/Icons.jsx";
import { MoonIcon, SunIcon } from "../features/medico/components/icons/MedicoIcons.jsx";
import { useAuthOpcional } from "../features/auth/auth.context.js";
import { ROTA_INICIAL_POR_ROLE } from "../features/auth/auth.rotas.js";
import { useTema } from "../tema/contextoDoTema.js";
import { NAV_ITEMS } from "./navigation.js";
import { cx } from "../utils/cx.js";
import styles from "./Header.module.css";

/* Busca expansível: cresce para a esquerda a partir da lupa até no máximo
   LARGURA_MAXIMA, parando ESPACO_LIVRE px antes do menu (ou do logo). Se não
   couber LARGURA_MINIMA, a busca desce como painel abaixo da faixa. */
const LARGURA_MAXIMA = 440;
const LARGURA_MINIMA = 220;
const ESPACO_LIVRE = 24;

/** Header global — o mesmo componente (e o mesmo tamanho) em todas as páginas. */
export default function Header() {
  const [openPanel, setOpenPanel] = useState(null); // "search" | "menu" | null
  const [query, setQuery] = useState("");
  const [larguraBusca, setLarguraBusca] = useState(null); // null = sem espaço: painel
  const navigate = useNavigate();
  const inputRef = useRef(null);
  const searchRef = useRef(null);
  const menuRef = useRef(null);
  const barRef = useRef(null);
  const buscaRef = useRef(null);
  const { usuario, sair } = useAuthOpcional();
  const { tema, alternarTema } = useTema();
  const escuro = tema === "escuro";
  const IconeTema = escuro ? SunIcon : MoonIcon;

  const encerrarSessao = () => {
    setOpenPanel(null);
    sair();
    navigate("/", { replace: true });
  };

  /* Logado, a faixa troca "Entrar / Criar conta" pelo atalho do painel. */
  const acoesDaConta = (variantes) =>
    usuario ? (
      <>
        <Button variant={variantes[0]} onClick={encerrarSessao} className={variantes[2]}>Sair</Button>
        <Button variant={variantes[1]} to={ROTA_INICIAL_POR_ROLE[usuario.role] ?? "/login"} onClick={() => setOpenPanel(null)} className={variantes[3]}>Meu painel</Button>
      </>
    ) : (
      <>
        <Button variant={variantes[0]} to="/login" onClick={() => setOpenPanel(null)} className={variantes[2]}>Entrar</Button>
        <Button variant={variantes[1]} to="/cadastro" onClick={() => setOpenPanel(null)} className={variantes[3]}>Criar conta</Button>
      </>
    );


  const toggle = (panel) => setOpenPanel((current) => (current === panel ? null : panel));

  /** Espaço entre o fim do menu (ou do logo) e a borda direita da lupa. */
  const medirBusca = useCallback(() => {
    const bar = barRef.current;
    const busca = buscaRef.current;
    if (!bar || !busca) return null;
    const ancora = busca.getBoundingClientRect().right;
    let limite = bar.getBoundingClientRect().left;
    for (const filho of bar.children) {
      if (filho.contains(busca)) break;
      if (filho.getClientRects().length) limite = Math.max(limite, filho.getBoundingClientRect().right);
    }
    const disponivel = Math.floor(ancora - limite - ESPACO_LIVRE);
    const largura = disponivel >= LARGURA_MINIMA ? Math.min(LARGURA_MAXIMA, disponivel) : null;
    setLarguraBusca(largura);
    return largura;
  }, []);

  const alternarBusca = () => {
    if (openPanel !== "search") medirBusca();
    toggle("search");
  };

  const buscaEmLinha = openPanel === "search" && larguraBusca !== null;

  // Aberta: acompanha o redimensionamento e fecha com clique fora.
  useEffect(() => {
    if (openPanel !== "search") return undefined;
    const aoRedimensionar = () => medirBusca();
    const aoClicarFora = (e) => {
      if (!buscaRef.current?.contains(e.target) && !e.target.closest?.("#header-search-painel")) setOpenPanel(null);
    };
    window.addEventListener("resize", aoRedimensionar);
    document.addEventListener("pointerdown", aoClicarFora);
    return () => {
      window.removeEventListener("resize", aoRedimensionar);
      document.removeEventListener("pointerdown", aoClicarFora);
    };
  }, [openPanel, medirBusca]);

  // Esc fecha painéis
  useEffect(() => {
    const onKey = (e) => {
      if (e.key !== "Escape" || !openPanel) return;
      setOpenPanel(null);
      (openPanel === "search" ? searchRef : menuRef).current?.focus();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [openPanel]);

  useEffect(() => {
    if (openPanel === "search") inputRef.current?.focus();
  }, [openPanel]);

  const handleSearch = (e) => {
    e.preventDefault();
    const q = query.trim();
    searchRef.current?.focus();
    navigate(q ? `/buscar?q=${encodeURIComponent(q)}` : "/buscar");
    setOpenPanel(null);
  };

  return (
    <header className={styles.header}>
      <div className={styles.bar} ref={barRef}>
        <Logo tone="light" />
        <span className={styles.divisor} aria-hidden="true" />

        <nav className={styles.nav} aria-label="Principal">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              onClick={() => setOpenPanel(null)}
              className={({ isActive }) => cx(styles.navLink, isActive && styles.active)}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className={styles.actions}>
          <div
            ref={buscaRef}
            className={cx(styles.busca, buscaEmLinha && styles.buscaAberta)}
            style={larguraBusca ? { "--busca-largura": `${larguraBusca}px` } : undefined}
          >
            <form
              id="header-search"
              className={styles.buscaForm}
              role="search"
              onSubmit={handleSearch}
              inert={!buscaEmLinha}
            >
              <button type="submit" className={styles.buscaEnviar}>
                <SearchIcon />
                <span className="sr-only">Buscar</span>
              </button>
              <label className="sr-only" htmlFor="header-search-input">Buscar profissionais ou especialidades</label>
              <input
                ref={buscaEmLinha ? inputRef : undefined}
                id="header-search-input"
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Busque por profissional ou especialidade"
              />
            </form>
            <button
              type="button"
              className={cx(styles.iconButton, styles.searchButton)}
              ref={searchRef}
              aria-expanded={openPanel === "search"}
              aria-controls={larguraBusca === null ? "header-search-painel" : "header-search"}
              onClick={alternarBusca}
            >
              {openPanel === "search" ? (
                <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" /></svg>
              ) : (
                <SearchIcon />
              )}
              <span className="sr-only">{openPanel === "search" ? "Fechar busca" : "Pesquisar"}</span>
            </button>
          </div>

          <button
            type="button"
            className={cx(styles.iconButton, styles.themeButton)}
            aria-pressed={escuro}
            onClick={alternarTema}
            title={escuro ? "Usar modo claro" : "Usar modo escuro"}
          >
            <IconeTema size={22} />
            <span className="sr-only">Modo escuro</span>
          </button>

          {acoesDaConta(["ghost", "light", styles.loginButton, styles.signupButton])}

          <button
            type="button"
            className={cx(styles.iconButton, styles.menuToggle)}
            ref={menuRef}
            aria-expanded={openPanel === "menu"}
            aria-controls="mobile-nav"
            onClick={() => toggle("menu")}
          >
            <MenuIcon />
            <span className="sr-only">Abrir menu</span>
          </button>
        </div>
      </div>

      {/* Sem espaço na faixa (telas estreitas): a busca desce como painel. */}
      {openPanel === "search" && larguraBusca === null && (
        <form id="header-search-painel" className={styles.searchPanel} role="search" onSubmit={handleSearch}>
          <label className="sr-only" htmlFor="header-search-painel-input">Buscar profissionais ou especialidades</label>
          <input
            ref={inputRef}
            id="header-search-painel-input"
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Busque por profissional ou especialidade"
          />
          <Button type="submit" className={styles.searchSubmit}>Buscar</Button>
        </form>
      )}

      {openPanel === "menu" && (
        <nav id="mobile-nav" className={styles.mobileNav} aria-label="Menu mobile">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              onClick={() => setOpenPanel(null)}
              className={({ isActive }) => cx(styles.mobileLink, isActive && styles.mobileLinkActive)}
            >
              {item.label}
            </NavLink>
          ))}
          <div className={styles.mobileActions}>
            {acoesDaConta(["outline", "primary"])}
          </div>
        </nav>
      )}
    </header>
  );
}
