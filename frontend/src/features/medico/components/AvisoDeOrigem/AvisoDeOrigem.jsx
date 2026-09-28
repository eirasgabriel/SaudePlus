import styles from "./AvisoDeOrigem.module.css";

/**
 * Faixa discreta dizendo de onde vieram os dados da tela.
 *
 * Só aparece quando a API não respondeu: em operação normal a tela fica
 * limpa. O texto é honesto sobre o que a pessoa está vendo — dados de
 * demonstração — em vez de deixar parecer que são reais.
 */
export default function AvisoDeOrigem({ origem, erro, aoTentarDeNovo }) {
  if (origem !== "mocks") {
    return null;
  }

  const motivo = erro?.offline
    ? "A API não respondeu"
    : erro?.message ?? "A API respondeu com erro";

  return (
    <div className={styles.faixa} role="status">
      <span className={styles.texto}>
        <strong>{motivo}.</strong> Mostrando dados de demonstração.
      </span>
      <button type="button" className={styles.botao} onClick={aoTentarDeNovo}>
        Tentar de novo
      </button>
    </div>
  );
}
