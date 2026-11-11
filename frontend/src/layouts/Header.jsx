import { NavLink, useNavigate } from "react-router-dom";
import { useEffect, useRef, useState } from "react";

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

/** Header global — o mesmo componente (e o mesmo tamanho) em todas as páginas. */
export default function Header() {
  const [openPanel, setOpenPanel] = useState(null); // "search" | "menu" | null
  const [query, setQuery] = useState("");
  const navigate = useNavigate();
  const inputRef = useRef(null);
  const searchRef = useRef(null);
  const menuRef = useRef(null);
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
      <div className={styles.bar}>
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
          <button
            type="button"
            className={cx(styles.iconButton, styles.searchButton)}
            ref={searchRef}
            aria-expanded={openPanel === "search"}
            aria-controls="header-search"
            onClick={() => toggle("search")}
          >
            <SearchIcon />
            <span className="sr-only">Pesquisar</span>
          </button>

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

      {openPanel === "search" && (
        <form id="header-search" className={styles.searchPanel} role="search" onSubmit={handleSearch}>
          <label className="sr-only" htmlFor="header-search-input">Buscar profissionais ou especialidades</label>
          <input
            ref={inputRef}
            id="header-search-input"
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
