import { cx } from "../../../../utils/cx.js";
import { STATUS_CONSULTA } from "../../data/medico.js";
import styles from "./AgendaFilter.module.css";

/**
 * Filtro de status da agenda.
 * As opções saem de STATUS_CONSULTA, então um status novo no mock aparece
 * aqui sozinho. A contagem de cada opção vem de `contagemPorStatus`.
 */
export default function AgendaFilter({ valor, onChange, contagem, total }) {
  const opcoes = [
    { chave: "todas", rotulo: "Todas", quantidade: total },
    ...Object.entries(STATUS_CONSULTA).map(([chave, { rotulo }]) => ({
      chave,
      rotulo,
      quantidade: contagem[chave] ?? 0,
    })),
  ];

  return (
    <div className={styles.grupo} role="group" aria-label="Filtrar agenda por status">
      {opcoes.map(({ chave, rotulo, quantidade }) => (
        <button
          key={chave}
          type="button"
          className={cx(styles.opcao, valor === chave && styles.ativa)}
          aria-pressed={valor === chave}
          onClick={() => onChange(chave)}
        >
          {rotulo}
          <span className={styles.quantidade}>{quantidade}</span>
        </button>
      ))}
    </div>
  );
}
