import { UserIcon } from "../../../../components/icons/Icons.jsx";
import LinkDestino from "../../navegacao/LinkDestino.jsx";
import styles from "./WelcomeBanner.module.css";

/**
 * Faixa de boas-vindas do painel. Contém o único <h1> da página.
 *
 * À direita fica o espaço da foto do médico. Com `foto` (quando ele marcou
 * "Mostrar minha foto na página principal" em Minha conta), mostra a foto;
 * sem ela, o espaço continua reservado, com um atalho para adicioná-la.
 */
export default function WelcomeBanner({ nome, subtitulo, foto, tituloId }) {
  return (
    <section className={styles.banner} aria-labelledby={tituloId}>
      <div className={styles.texto}>
        <h1 id={tituloId} className={styles.titulo}>
          Olá, {nome}!
        </h1>
        <p className={styles.subtitulo}>{subtitulo}</p>
      </div>

      <div className={styles.visual}>
        {foto ? (
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
    </section>
  );
}
