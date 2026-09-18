import styles from "./WelcomeBanner.module.css";

/**
 * Faixa de boas-vindas do painel. Contém o único <h1> da página.
 *
 * Sem `imagem`, desenha uma ilustração provisória em SVG — mesmo recurso
 * usado no dashboard do paciente, para não depender de uma foto que ainda
 * não existe no repositório. Passe `imagem` quando houver o arquivo real.
 */
export default function WelcomeBanner({ nome, subtitulo, imagem, tituloId }) {
  return (
    <section className={styles.banner} aria-labelledby={tituloId}>
      <div className={styles.texto}>
        <h1 id={tituloId} className={styles.titulo}>
          Olá, {nome}!
        </h1>
        <p className={styles.subtitulo}>{subtitulo}</p>
      </div>

      <div className={styles.visual} aria-hidden="true">
        {imagem ? (
          <img src={imagem} alt="" className={styles.foto} />
        ) : (
          <svg viewBox="0 0 260 200" preserveAspectRatio="xMidYMax meet" className={styles.ilustracao}>
            <ellipse cx="130" cy="196" rx="96" ry="26" fill="#D7E9FB" opacity=".7" />
            {/* jaleco */}
            <path d="M74 200c2-36 18-56 44-63l12 10 12-10c26 7 42 27 44 63z" fill="#FFFFFF" />
            <path d="M118 137l12 10 12-10 7 3-19 17-19-17z" fill="#E4EFFA" />
            <path d="M130 147l-6 53h12z" fill="#EAF3FC" />
            {/* gola e camisa */}
            <path d="M118 137l12 10-10 12-10-19z" fill="#BFD9F2" />
            <path d="M142 137l-12 10 10 12 10-19z" fill="#BFD9F2" />
            {/* estetoscópio */}
            <path d="M116 140c0 22 12 33 25 33s25-11 25-31" fill="none" stroke="#2C7BE5" strokeWidth="3.4" strokeLinecap="round" />
            <circle cx="166" cy="140" r="6" fill="none" stroke="#2C7BE5" strokeWidth="3.4" />
            {/* rosto */}
            <path d="M104 92c-4-30 10-48 26-48s30 18 26 48c-3 22-14 33-26 33s-23-11-26-33z" fill="#F3C9A9" />
            <path d="M101 88c-5-34 12-52 29-52s34 18 29 52c3-38-14-40-29-31-15-9-32-7-29 31z" fill="#C9CFD8" />
            <path d="M112 86q5-4 10 0M138 86q5-4 10 0" fill="none" stroke="#6B5646" strokeWidth="2.6" strokeLinecap="round" />
            <path d="M120 104q10 8 20 0" fill="none" stroke="#B5705E" strokeWidth="2.6" strokeLinecap="round" />
            <path d="M112 112q18 14 36 0" fill="#C9CFD8" opacity=".75" />
          </svg>
        )}
      </div>
    </section>
  );
}
