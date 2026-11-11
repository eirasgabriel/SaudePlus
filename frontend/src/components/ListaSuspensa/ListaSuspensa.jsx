import { useEffect, useId, useRef, useState } from "react";
import { ChevronDownIcon, CheckIcon } from "../icons/Icons.jsx";
import { cx } from "../../utils/cx.js";
import styles from "./ListaSuspensa.module.css";

const normalizarOpcao = (opt) => (typeof opt === "string" ? { value: opt, label: opt } : opt);
const semAcento = (t) => t.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");

/**
 * Seleção de uma opção com a lista no visual do site (claro e escuro), no
 * lugar da lista nativa do navegador, que ignora o tema.
 * Segue o padrão "select-only combobox" da WAI-ARIA: o botão tem o foco e
 * anuncia a opção ativa; setas, Home/End, Enter, Esc e digitação funcionam.
 *
 * `labelledBy`: id do rótulo visível. `className`: classe do botão.
 * `raizClassName` / `listaClassName`: para ancorar a lista em outro elemento
 * (ex.: o campo inteiro) ou mudar sua posição.
 */
export default function ListaSuspensa({
  id, labelledBy, value, onChange, options, className, raizClassName, listaClassName, alinhar = "esquerda", children,
}) {
  const opcoes = options.map(normalizarOpcao);
  const indiceAtual = Math.max(0, opcoes.findIndex((o) => o.value === value));
  const [aberta, setAberta] = useState(false);
  const [ativa, setAtiva] = useState(indiceAtual);
  const raizRef = useRef(null);
  const listaRef = useRef(null);
  const busca = useRef({ texto: "", ate: 0 });
  const listaId = useId();
  const opcaoId = (i) => `${listaId}-opcao-${i}`;

  const abrir = (indice = indiceAtual) => {
    setAtiva(indice);
    setAberta(true);
  };
  const escolher = (indice) => {
    const opcao = opcoes[indice];
    if (opcao && opcao.value !== value) onChange(opcao.value);
    setAberta(false);
  };

  // Clique fora fecha.
  useEffect(() => {
    if (!aberta) return undefined;
    const fora = (e) => {
      if (!raizRef.current?.contains(e.target)) setAberta(false);
    };
    document.addEventListener("pointerdown", fora);
    return () => document.removeEventListener("pointerdown", fora);
  }, [aberta]);

  // Mantém a opção ativa à vista dentro da lista.
  useEffect(() => {
    if (!aberta) return;
    const el = listaRef.current?.querySelector(`[data-indice="${ativa}"]`);
    el?.scrollIntoView?.({ block: "nearest" });
  }, [aberta, ativa]);

  const procurarPorTexto = (tecla) => {
    const agora = Date.now();
    busca.current = { texto: (agora < busca.current.ate ? busca.current.texto : "") + semAcento(tecla), ate: agora + 600 };
    const inicio = aberta ? ativa : indiceAtual;
    const ordem = [...opcoes.keys()].map((k) => (inicio + 1 + k) % opcoes.length);
    const achada = ordem.find((i) => semAcento(String(opcoes[i].label)).startsWith(busca.current.texto));
    if (achada === undefined) return;
    if (aberta) setAtiva(achada);
    else escolher(achada);
  };

  const aoTeclar = (e) => {
    const ultimo = opcoes.length - 1;
    if (!aberta) {
      if (["ArrowDown", "ArrowUp", "Enter", " "].includes(e.key)) {
        e.preventDefault();
        abrir();
      } else if (e.key === "Home" || e.key === "End") {
        e.preventDefault();
        abrir(e.key === "Home" ? 0 : ultimo);
      } else if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
        procurarPorTexto(e.key);
      }
      return;
    }
    switch (e.key) {
      case "ArrowDown": e.preventDefault(); setAtiva((i) => Math.min(i + 1, ultimo)); break;
      case "ArrowUp": e.preventDefault(); setAtiva((i) => Math.max(i - 1, 0)); break;
      case "Home": e.preventDefault(); setAtiva(0); break;
      case "End": e.preventDefault(); setAtiva(ultimo); break;
      case "PageDown": e.preventDefault(); setAtiva((i) => Math.min(i + 10, ultimo)); break;
      case "PageUp": e.preventDefault(); setAtiva((i) => Math.max(i - 10, 0)); break;
      case "Enter":
      case " ": e.preventDefault(); escolher(ativa); break;
      case "Escape": e.preventDefault(); e.stopPropagation(); setAberta(false); break;
      case "Tab": escolher(ativa); break;
      default:
        if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) procurarPorTexto(e.key);
    }
  };

  return (
    <div ref={raizRef} className={cx(styles.raiz, raizClassName)}>
      <button
        id={id}
        type="button"
        role="combobox"
        aria-haspopup="listbox"
        aria-expanded={aberta}
        aria-controls={listaId}
        aria-labelledby={labelledBy ? `${labelledBy} ${id}` : undefined}
        aria-activedescendant={aberta ? opcaoId(ativa) : undefined}
        className={cx(styles.gatilho, className)}
        onClick={() => (aberta ? setAberta(false) : abrir())}
        onKeyDown={aoTeclar}
      >
        <span className={styles.valor}>{opcoes[indiceAtual]?.label}</span>
        {children ?? <ChevronDownIcon size={20} className={cx(styles.seta, aberta && styles.setaAberta)} />}
      </button>

      <ul
        ref={listaRef}
        id={listaId}
        role="listbox"
        aria-labelledby={labelledBy}
        tabIndex={-1}
        hidden={!aberta}
        className={cx(styles.lista, alinhar === "direita" && styles.direita, listaClassName)}
      >
        {opcoes.map((o, i) => {
          const selecionada = i === indiceAtual;
          return (
            <li
              key={o.value}
              id={opcaoId(i)}
              data-indice={i}
              role="option"
              aria-selected={selecionada}
              className={cx(styles.opcao, i === ativa && styles.ativa, selecionada && styles.selecionada)}
              onPointerMove={() => setAtiva(i)}
              onMouseDown={(e) => e.preventDefault() /* o foco fica no botão */}
              onClick={() => escolher(i)}
            >
              <span className={styles.rotulo}>{o.label}</span>
              {selecionada && <CheckIcon size={16} className={styles.check} />}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
