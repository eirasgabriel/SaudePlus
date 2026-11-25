import { useId } from "react";

import { cx } from "../../utils/cx.js";
import { IDENTIDADE_PADRAO, useIdentidadeDoSite } from "../../services/identidadeDoSite.js";
import styles from "./Footer.module.css";

/* ============================================================================
   RODAPÉ COMPARTILHADO
   ============================================================================

   Fica em `components/` — e não dentro de uma feature — porque as quatro
   telas usam o mesmo: home, painel do paciente, do médico e do admin.

   Não depende de React Router nem de contexto nenhum: os links são <a> com
   o caminho real. Isso é o que permite usá-lo tanto no site institucional,
   que já tem roteador, quanto nos painéis, que ainda não têm.

   Links marcados com `reservado` apontam para páginas que ainda não
   existem. Quem usa o rodapé pode passar `aoClicarReservado` para tratá-los
   (o painel do médico abre o aviso de "em breve"); sem isso, o link navega
   normalmente e cai na página de "não encontrada" do app.

   COMO USAR NAS OUTRAS TELAS

     import Footer from "../../components/Footer/Footer.jsx";
     ...
     <Footer />                                   // site institucional
     <Footer aoClicarReservado={...} />           // painéis, com aviso

   Para alinhar a largura com a do conteúdo acima, defina a variável
   `--rodape-largura` no elemento pai (veja DashboardLayout.module.css).
   ========================================================================= */

/** Páginas que já existem no site institucional. */
const PLATAFORMA = [
  { rotulo: "Início", href: "/" },
  { rotulo: "Especialidades", href: "/especialidades" },
  { rotulo: "Buscar profissionais", href: "/buscar" },
  { rotulo: "Como funciona", href: "/como-funciona" },
];

const SUPORTE = [
  { rotulo: "Central de ajuda", href: "/ajuda" },
  /* A página de Ajuda já tem o painel de contato — por isso este link leva
     para lá, em vez de inventar um e-mail que ninguém lê. */
  { rotulo: "Fale conosco", href: "/ajuda" },
  { rotulo: "Sobre nós", href: "/sobre-nos" },
];

/* Estas três ainda não existem. Num sistema de saúde elas não são
   decorativas: a LGPD exige informar como os dados são tratados, e hoje o
   painel afirma "Seus dados estão seguros" sem ter para onde apontar. */
const LEGAL = [
  { rotulo: "Política de Privacidade", href: "/privacidade", reservado: true },
  { rotulo: "Termos de Uso", href: "/termos", reservado: true },
  { rotulo: "Acessibilidade", href: "/acessibilidade", reservado: true },
];

function Coluna({ titulo, itens, aoClicarReservado }) {
  const idTitulo = `${useId().replace(/[^a-zA-Z0-9_-]/g, "")}-col`;

  return (
    <nav className={styles.coluna} aria-labelledby={idTitulo}>
      <h2 id={idTitulo} className={styles.tituloColuna}>
        {titulo}
      </h2>
      <ul className={styles.lista}>
        {itens.map(({ rotulo, href, reservado }) => (
          <li key={rotulo}>
            <a
              href={href}
              className={styles.link}
              onClick={(evento) => {
                if (!reservado || !aoClicarReservado) return;
                evento.preventDefault();
                aoClicarReservado({ rotulo, href });
              }}
            >
              {rotulo}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}

/**
 * Rodapé do SaúdePlus.
 *
 * @param aoClicarReservado  chamado no lugar da navegação quando o link
 *                           aponta para uma página que ainda não existe
 * @param ano                ano do aviso de direitos; padrão é o ano atual
 * @param tom                "azul" para a variante do site público (visual do hero)
 * @param className          para ajustes pontuais de quem usa
 */
export default function Footer({ aoClicarReservado, ano = new Date().getFullYear(), tom, className }) {
  // Nome, descrição e contatos de Configurações > Geral; sem eles, o padrão.
  const identidade = useIdentidadeDoSite({ carregar: false });
  const nomePadrao = identidade.nomeSistema === IDENTIDADE_PADRAO.nomeSistema;
  const contatos = [
    identidade.emailSuporte && <a key="email" href={`mailto:${identidade.emailSuporte}`}>{identidade.emailSuporte}</a>,
    identidade.telefone && <a key="telefone" href={`tel:${identidade.telefone.replace(/[^\d+]/g, "")}`}>{identidade.telefone}</a>,
    identidade.endereco && <span key="endereco">{identidade.endereco}</span>,
  ].filter(Boolean);
  return (
    <footer className={cx(styles.rodape, tom === "azul" && styles.azul, className)}>
      <div className={styles.conteudo}>
        <div className={styles.grade}>
          <div className={styles.marca}>
            <span className={styles.nome}>
              {nomePadrao ? <>Saúde<span>Plus</span></> : identidade.nomeSistema}
            </span>
            <p className={styles.slogan}>A sua saúde, sempre andando junto com você!</p>
            <p className={styles.texto}>{identidade.descricao}</p>
            {contatos.length > 0 && <p className={styles.texto}>{contatos.reduce((lista, item) => [...lista, lista.length ? " · " : null, item], [])}</p>}
          </div>

          <Coluna titulo="Plataforma" itens={PLATAFORMA} aoClicarReservado={aoClicarReservado} />
          <Coluna titulo="Suporte" itens={SUPORTE} aoClicarReservado={aoClicarReservado} />
          <Coluna titulo="Legal" itens={LEGAL} aoClicarReservado={aoClicarReservado} />
        </div>

        <div className={styles.base}>
          <p className={styles.direitos}>© {ano} {identidade.nomeSistema}. Todos os direitos reservados.</p>
          {/* Deixa explícito que não é um serviço em operação. Num site de
              saúde, parecer real sem ser é pior do que parecer inacabado. */}
          <p className={styles.aviso}>
            Projeto acadêmico em desenvolvimento — Engenharia de Software, Universidade de Vassouras.
          </p>
        </div>
      </div>
    </footer>
  );
}
