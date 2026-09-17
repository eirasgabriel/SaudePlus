import { NavLink, useNavigate } from "react-router-dom";
import { useEffect, useRef, useState } from "react";

import Logo from "../components/Logo/Logo.jsx";
import Button from "../components/Button/Button.jsx";
import { SearchIcon, MenuIcon } from "../components/icons/Icons.jsx";
import { NAV_ITEMS } from "./navigation.js";
import { cx } from "../utils/cx.js";
import styles from "./Header.module.css";

/** Header global — o mesmo componente (e o mesmo tamanho) em todas as páginas. */
export default function Header({ onUnavailable }) {
  const [openPanel, setOpenPanel] = useState(null); // "search" | "menu" | null
  const [query, setQuery] = useState("");
  const navigate = useNavigate();
  const inputRef = useRef(null);
  const searchRef = useRef(null);
  const menuRef = useRef(null);


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
        <Logo />

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

          <Button variant="outline" onClick={() => { setOpenPanel(null); onUnavailable("Entrar"); }} className={styles.loginButton}>Entrar</Button>
          <Button variant="primary" onClick={() => { setOpenPanel(null); onUnavailable("Criar conta"); }} className={styles.signupButton}>Criar conta</Button>

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
            <Button variant="outline" onClick={() => { setOpenPanel(null); onUnavailable("Entrar"); }}>Entrar</Button>
            <Button variant="primary" onClick={() => { setOpenPanel(null); onUnavailable("Criar conta"); }}>Criar conta</Button>
          </div>
        </nav>
      )}
    </header>
  );
}
