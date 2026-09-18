import DashboardHeader from "./DashboardHeader.jsx";
import DashboardSidebar from "./DashboardSidebar.jsx";
import styles from "./DashboardLayout.module.css";

/**
 * Casca do painel do médico: link de pular, cabeçalho, barra lateral e a
 * grade de três colunas. O conteúdo central e a coluna direita são passados
 * pela página.
 *
 * O `<main id="conteudo" tabIndex={-1}>` repete o contrato do MainLayout
 * institucional, para que o link de pular funcione igual nas duas áreas.
 */
export default function DashboardLayout({ medico, totalNotificacoes, aside, children }) {
  return (
    <div className={styles.pagina}>
      <a className="skip-link" href="#conteudo">
        Pular para o conteúdo
      </a>

      <DashboardHeader medico={medico} totalNotificacoes={totalNotificacoes} />

      <div className={styles.grade}>
        <DashboardSidebar />

        <main id="conteudo" className={styles.conteudo} tabIndex={-1}>
          {children}
        </main>

        {aside && <div className={styles.trilhaDireita}>{aside}</div>}
      </div>
    </div>
  );
}
