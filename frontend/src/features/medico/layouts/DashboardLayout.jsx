import Footer from "../../../components/Footer/Footer.jsx";
import { cx } from "../../../utils/cx.js";
import { useNavegacao } from "../navegacao/useNavegacao.js";
import { useTema } from "../tema/useTema.js";
import "../tema/temaEscuro.css";
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
  /* Lista de notificações (lidas e não lidas): o sino mostra as não lidas
     num menu suspenso. Sem ela, só o contador `totalNotificacoes`. */
  notificacoes,
  totalNotificacoes,
  aside,
  children,
}) {
  const { avisarEmBreve } = useNavegacao();
  const { tema, alternarTema } = useTema();

  return (
    <div className={styles.pagina} data-tema={tema}>
      <a className="skip-link" href="#conteudo">
        Pular para o conteúdo
      </a>

      <DashboardHeader
        medico={medico}
        notificacoes={notificacoes}
        totalNotificacoes={totalNotificacoes}
        tema={tema}
        aoAlternarTema={alternarTema}
      />

      {/* A barra lateral é casca (marinho); a área de trabalho clara encaixa
          nela pela curva do canto superior esquerdo. */}
      <div className={styles.corpo}>
        <DashboardSidebar />

        <div className={styles.area}>
          <div className={cx(styles.grade, !aside && styles.semTrilha)}>
            <main id="conteudo" className={styles.conteudo} tabIndex={-1}>
              {children}
            </main>

            {aside && <div className={styles.trilhaDireita}>{aside}</div>}
          </div>
        </div>
      </div>

      <Footer
        className={styles.rodape}
        aoClicarReservado={({ rotulo, href }) => avisarEmBreve(rotulo, href)}
      />
    </div>
  );
}
