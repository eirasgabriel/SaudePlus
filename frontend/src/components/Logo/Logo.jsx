import { Link } from "react-router-dom";
import { useId } from "react";
import { cx } from "../../utils/cx.js";
import styles from "./Logo.module.css";

/**
 * Marca do SaúdePlus.
 * `tone="light"`: versão para o cabeçalho azul (texto branco, cruz branca com coração azul).
 * `tagline={false}`: só cruz + nome, para barras compactas.
 */
export default function Logo({ tone = "dark", tagline = true, to = "/", className }) {
  const id = useId();
  const cross = `${id}-cross`;
  const heart = `${id}-heart`;
  const light = tone === "light";

  return (
    <Link to={to} className={cx(styles.logo, light && styles.light, className)} aria-label="SaúdePlus — página inicial">
      {/* Cruz de cantos arredondados com o coração azul cuja ponta desce
          dobrada pela borda do braço direito. Sem fundo: funciona sobre o
          degradê do cabeçalho. */}
      <svg className={styles.mark} viewBox="207 204 840 846" aria-hidden="true">
        <defs>
          <linearGradient id={cross} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0.45" stopColor={light ? "#FFFFFF" : "#0A4FC4"} />
            <stop offset="1" stopColor={light ? "#CBE7F8" : "#0A2A7E"} />
          </linearGradient>
          <linearGradient id={heart} x1="0.15" y1="0.1" x2="0.85" y2="0.75">
            <stop offset="0" stopColor="#0A2FA8" />
            <stop offset="0.6" stopColor="#0A5AE0" />
            <stop offset="1" stopColor="#0A8BFF" />
          </linearGradient>
        </defs>
        <path
          fill={`url(#${cross})`}
          d="M570 214H682A100 100 0 0 1 782 314V436A35 35 0 0 0 817 471H936A100 100 0 0 1 1036 571V679A100 100 0 0 1 936 779H817A35 35 0 0 0 782 814V940A100 100 0 0 1 682 1040H570A100 100 0 0 1 470 940V814A35 35 0 0 0 435 779H317A100 100 0 0 1 217 679V571A100 100 0 0 1 317 471H435A35 35 0 0 0 470 436V314A100 100 0 0 1 570 214Z"
        />
        <path
          fill={`url(#${heart})`}
          d="M704 576C726 534 764 512 806 512C870 512 921 562 921 628C921 690 878 738 806 782L782 797V938C762 922 718 903 668 882C562 832 478 735 478 640C478 562 530 512 598 512C642 512 682 536 704 576Z"
        />
        {/* Dobra da ponta do coração */}
        <path fill="#0626A0" d="M668 882C705 846 752 814 806 782L782 797V938C762 922 718 903 668 882Z" />
      </svg>
      <span className={styles.text}>
        <span className={styles.name}>Saúde<span>Plus</span></span>
        {tagline && <span className={styles.tagline}>A sua Saúde, sempre andando junto com você!</span>}
      </span>
    </Link>
  );
}
