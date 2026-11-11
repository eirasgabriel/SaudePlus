import { UserIcon } from "../../../../components/icons/Icons.jsx";
import { cx } from "../../../../utils/cx.js";
import LinkDestino from "../../navegacao/LinkDestino.jsx";
import styles from "./WelcomeBanner.module.css";

/**
 * Faixa de boas-vindas do painel. Contém o único <h1> da página.
 *
 * À direita fica o espaço da foto do médico. Com `foto` (quando ele marcou
 * "Mostrar minha foto na página principal" em Minha conta), mostra a foto;
 * sem ela, o espaço continua reservado, com um atalho para adicioná-la.
 *
 * As dashboards do paciente, da equipe e da unidade clínica usam a mesma
 * faixa com `imagem={null}`: só o texto, ocupando a largura toda. Com
 * `imagem`, mostra essa imagem decorativa no lugar da foto.
 */
export default function WelcomeBanner({ nome, subtitulo, foto, imagem, tituloId }) {
  const semVisual = imagem === null;
  return (
    <section className={cx(styles.banner, semVisual && styles.semVisual)} aria-labelledby={tituloId}>
      <div className={styles.texto}>
        <h1 id={tituloId} className={styles.titulo}>
          Olá, {nome}!
        </h1>
        <p className={styles.subtitulo}>{subtitulo}</p>
      </div>

      {!semVisual && (
        <div className={styles.visual}>
          {imagem ? (
            <img src={imagem} alt="" className={styles.foto} />
          ) : foto ? (
            <img src={foto} alt={`Foto de ${nome}`} className={styles.foto} />
          ) : (
            <LinkDestino destino="conta" className={styles.reservado}>
              <span className={styles.reservadoCirculo} aria-hidden="true">
                <UserIcon size={40} />
              </span>
              <span className={styles.reservadoTexto}>Adicionar sua foto</span>
            </LinkDestino>
          )}
        </div>
      )}
    </section>
  );
}
