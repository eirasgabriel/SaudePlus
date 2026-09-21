import { useId } from "react";
import Icone from "./Icone";
import estilos from "./Controles.module.css";

/* =========================================================
   Interruptor (toggle)
   ========================================================= */
export function Interruptor({ ligado, aoAlternar, rotulo, desabilitado = false }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={ligado}
      aria-label={rotulo}
      disabled={desabilitado}
      onClick={() => aoAlternar?.(!ligado)}
      className={`${estilos.interruptor} ${ligado ? estilos.interruptorLigado : ""}`}
    >
      <span className={estilos.bolinha} />
    </button>
  );
}

/* =========================================================
   Campo de busca (controlado)
   ========================================================= */
export function CampoBusca({ valor, aoMudar, placeholder = "Buscar...", className = "" }) {
  return (
    <div className={`${estilos.busca} ${className}`}>
      <Icone nome="busca" tam={17} className={estilos.buscaIcone} />
      <input
        type="search"
        className={estilos.buscaInput}
        value={valor}
        placeholder={placeholder}
        onChange={(e) => aoMudar(e.target.value)}
        aria-label={placeholder}
      />
      {valor && (
        <button
          type="button"
          className={estilos.limpar}
          onClick={() => aoMudar("")}
          aria-label="Limpar busca"
        >
          <Icone nome="alertaX" tam={16} />
        </button>
      )}
    </div>
  );
}

/* =========================================================
   Seletor (select)
   ========================================================= */
export function Seletor({
  rotulo,
  valor,
  aoMudar,
  opcoes = [],
  icone,
  className = "",
}) {
  const id = useId();

  return (
    <div className={`${estilos.campoSeletor} ${className}`}>
      {rotulo && (
        <label className={estilos.rotuloSeletor} htmlFor={id}>
          {rotulo}
        </label>
      )}
      <div className={estilos.seletorWrap}>
        {icone && <Icone nome={icone} tam={16} className={estilos.seletorIcone} />}
        <select
          id={id}
          className={`${estilos.seletor} ${icone ? estilos.comIcone : ""}`}
          value={valor}
          onChange={(e) => aoMudar(e.target.value)}
          aria-label={rotulo}
        >
          {opcoes.map((op) => (
            <option key={op.valor} value={op.valor}>
              {op.rotulo}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}

/* =========================================================
   Campo de texto / área de texto
   ========================================================= */
export function Campo({
  rotulo,
  valor,
  aoMudar,
  icone,
  tipo = "text",
  linhas,
  maximo,
  placeholder,
  className = "",
}) {
  const id = useId();
  const ehArea = Boolean(linhas);

  return (
    <div className={`${estilos.campo} ${className}`}>
      {rotulo && (
        <label className={estilos.rotuloCampo} htmlFor={id}>
          {rotulo}
        </label>
      )}

      <div className={estilos.entradaWrap}>
        {icone && !ehArea && (
          <Icone nome={icone} tam={16} className={estilos.entradaIcone} />
        )}

        {ehArea ? (
          <textarea
            id={id}
            className={estilos.entrada}
            rows={linhas}
            maxLength={maximo}
            value={valor}
            placeholder={placeholder}
            onChange={(e) => aoMudar?.(e.target.value)}
          />
        ) : (
          <input
            id={id}
            type={tipo}
            className={estilos.entrada}
            style={icone ? { paddingLeft: 38 } : undefined}
            maxLength={maximo}
            value={valor}
            placeholder={placeholder}
            onChange={(e) => aoMudar?.(e.target.value)}
          />
        )}
      </div>

      {maximo && (
        <span className={estilos.contador}>
          {valor.length}/{maximo}
        </span>
      )}
    </div>
  );
}

/* =========================================================
   Botão
   ========================================================= */
export function Botao({
  children,
  variante = "primario",
  icone,
  iconeDireita,
  blocoTotal = false,
  className = "",
  ...resto
}) {
  return (
    <button
      type="button"
      className={`${estilos.botao} ${estilos[variante]} ${
        blocoTotal ? estilos.blocoTotal : ""
      } ${className}`}
      {...resto}
    >
      {icone && <Icone nome={icone} tam={17} />}
      {children}
      {iconeDireita && <Icone nome={iconeDireita} tam={17} />}
    </button>
  );
}
