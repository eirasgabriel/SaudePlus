import Icone from "./Icone";
import estilos from "./Abas.module.css";

/**
 * Barra de abas.
 *
 * <Abas
 *   abas={[{ id:'geral', rotulo:'Geral', icone:'engrenagem' }, ...]}
 *   ativa={aba}
 *   aoTrocar={setAba}
 * />
 */
export default function Abas({ abas, ativa, aoTrocar }) {
  return (
    <div className={estilos.abas} role="tablist" aria-label="Seções de configuração">
      {abas.map((aba) => {
        const selecionada = aba.id === ativa;
        return (
          <button
            key={aba.id}
            type="button"
            role="tab"
            aria-selected={selecionada}
            className={`${estilos.aba} ${selecionada ? estilos.ativa : ""}`}
            onClick={() => aoTrocar(aba.id)}
          >
            {aba.icone && <Icone nome={aba.icone} tam={17} />}
            {aba.rotulo}
          </button>
        );
      })}
    </div>
  );
}
