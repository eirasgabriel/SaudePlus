import { Link } from "react-router-dom";
import { useId } from "react";
import styles from "./Logo.module.css";

export default function Logo() {
  const id = useId();
  const cross = `${id}-cross`;
  const heart = `${id}-heart`;

  return (
    <Link to="/" className={styles.logo} aria-label="SaúdePlus — página inicial">
      <svg className={styles.mark} viewBox="0 0 52 62" aria-hidden="true">
        <defs>
          <linearGradient id={cross} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#0A2A7E" />
            <stop offset=".55" stopColor="#0A4FC4" />
            <stop offset="1" stopColor="#1C82F5" />
          </linearGradient>
          <linearGradient id={heart} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#FFFFFF" />
            <stop offset="1" stopColor="#9CD3FF" />
          </linearGradient>
        </defs>
        <path
          fill={`url(#${cross})`}
          d="M21 1h10a5 5 0 0 1 5 5v13h11a5 5 0 0 1 5 5v14a5 5 0 0 1-5 5H36v13a5 5 0 0 1-5 5H21a5 5 0 0 1-5-5V43H5a5 5 0 0 1-5-5V24a5 5 0 0 1 5-5h11V6a5 5 0 0 1 5-5z"
        />
        <path
          fill={`url(#${heart})`}
          stroke="#fff"
          strokeWidth="2.2"
          strokeLinejoin="round"
          d="M25.5 44.5c-7.4-4.6-11.2-8.6-11.2-13 0-3.3 2.5-5.8 5.6-5.8 2.3 0 4.3 1.2 5.6 3.1 1.3-1.9 3.3-3.1 5.6-3.1 3.1 0 5.6 2.5 5.6 5.8 0 3.2-2 6.1-5.9 9.1l2.6 4.2-5.4-1.9c-.8.5-1.6 1-2.5 1.6z"
        />
      </svg>
      <span className={styles.text}>
        <span className={styles.name}>Saúde<span>Plus</span></span>
        <span className={styles.tagline}>A sua Saúde, sempre andando junto com você!</span>
      </span>
    </Link>
  );
}
