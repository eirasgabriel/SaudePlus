import { useId, useState } from "react";
import Icone from "./Icone";
import estilos from "./Acordeao.module.css";

/**
 * Acordeão usado no FAQ do Suporte.
 * `itens`: [{ id, pergunta, resposta }]
 * Por padrão abre um item por vez; `multiplos` permite vários abertos.
 */
export default function Acordeao({ itens, multiplos = false }) {
  const [abertos, setAbertos] = useState([]);
  const idBase = useId();

  function alternar(id) {
    setAbertos((atuais) => {
      const jaAberto = atuais.includes(id);
      if (multiplos) {
        return jaAberto ? atuais.filter((i) => i !== id) : [...atuais, id];
      }
      return jaAberto ? [] : [id];
    });
  }

  return (
    <div className={estilos.lista}>
      {itens.map((item) => {
        const aberto = abertos.includes(item.id);
        const idPainel = `${idBase}-${item.id}`;

        return (
          <div
            key={item.id}
            className={`${estilos.item} ${aberto ? estilos.itemAberto : ""}`}
          >
            <button
              type="button"
              className={estilos.gatilho}
              onClick={() => alternar(item.id)}
              aria-expanded={aberto}
              aria-controls={idPainel}
            >
              {item.pergunta}
              <Icone
                nome="chevronBaixo"
                tam={18}
                className={`${estilos.seta} ${aberto ? estilos.setaAberta : ""}`}
              />
            </button>

            {aberto && (
              <div className={estilos.resposta} id={idPainel} role="region">
                {item.resposta}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
