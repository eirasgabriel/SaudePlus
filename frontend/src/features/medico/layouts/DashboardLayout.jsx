import Footer from "../../../components/Footer/Footer.jsx";
import { cx } from "../../../utils/cx.js";
import { useNavegacao } from "../navegacao/useNavegacao.js";
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
 *
 * O rodapé é o componente compartilhado `components/Footer` — o mesmo das
 * outras telas. Fica fora da grade de três colunas, atravessando a largura
 * inteira, e recebe o tratamento dos links ainda sem página.
 */
export default function DashboardLayout({
  medico,
  totalNotificacoes,
  /* Id do <h2> do painel de Notificações. O sino do cabeçalho usa esse id
     para rolar até lá em vez de apontar para uma tela que não existe. */
  idPainelNotificacoes,
  aside,
  children,
}) {
  const { avisarEmBreve } = useNavegacao();

  return (
    <div className={styles.pagina}>
      <a className="skip-link" href="#conteudo">
        Pular para o conteúdo
      </a>

      <DashboardHeader
        medico={medico}
        totalNotificacoes={totalNotificacoes}
        idPainelNotificacoes={idPainelNotificacoes}
      />

      <div className={cx(styles.grade, !aside && styles.semTrilha)}>
        <DashboardSidebar />

        <main id="conteudo" className={styles.conteudo} tabIndex={-1}>
          {children}
        </main>

        {aside && <div className={styles.trilhaDireita}>{aside}</div>}
      </div>

      <Footer
        className={styles.rodape}
        aoClicarReservado={({ rotulo, href }) => avisarEmBreve(rotulo, href)}
      />
    </div>
  );
}
