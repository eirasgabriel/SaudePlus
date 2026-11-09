import { Link } from "react-router-dom";

import { mensagemDaFalha } from "./mensagemDaFalha.js";
import styles from "./PortaoDaApi.module.css";

/**
 * Só deixa a tela aparecer com dados da API.
 *
 * O sistema não mostra dados de demonstração: enquanto a API responde, aparece
 * "Carregando…"; se ela falhar, o erro com "Tentar de novo". `estados` é um
 * retorno de `useDadosDaApi`/`usePainelMedico` ou uma lista deles (a tela só
 * abre quando todos chegaram). `children` pode ser uma função, para só montar
 * a tela — e ler `dados` — depois que tudo carregou.
 *
 * `voltar`: link opcional `{ to, rotulo }` mostrado junto do erro.
 */
export default function PortaoDaApi({ estados, carregando = "Carregando…", voltar, children }) {
  const lista = Array.isArray(estados) ? estados : [estados];
  const falhas = lista.filter((estado) => estado.origem === "erro");

  if (falhas.length > 0) {
    const tentarDeNovo = () => falhas.forEach((estado) => (estado.tentarDeNovo ?? estado.recarregar)?.());
    return (
      <div className={styles.caixa} role="alert">
        <p className={styles.titulo}>Não foi possível carregar os dados.</p>
        <p className={styles.texto}>{mensagemDaFalha(falhas[0].erro)}</p>
        <div className={styles.acoes}>
          <button type="button" className={styles.botao} onClick={tentarDeNovo}>
            Tentar de novo
          </button>
          {voltar && (
            <Link to={voltar.to} className={styles.link}>
              {voltar.rotulo}
            </Link>
          )}
        </div>
      </div>
    );
  }

  if (lista.some((estado) => estado.origem !== "api")) {
    return (
      <p className={styles.carregando} role="status" aria-live="polite">
        {carregando}
      </p>
    );
  }

  return typeof children === "function" ? children() : children;
}
