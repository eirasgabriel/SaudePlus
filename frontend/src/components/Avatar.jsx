import { useState } from "react";
import estilos from "./Avatar.module.css";

/** Iniciais do nome, no máximo duas letras. */
export function iniciais(nome = "") {
  return nome
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((parte) => parte[0])
    .join("")
    .toUpperCase();
}

/** Cor estável derivada do nome, para quando não houver cor definida. */
const paleta = ["#0066FF", "#3B82F6", "#14B8A6", "#6366F1", "#F59E0B", "#EC4899", "#A855F7"];

function corDoNome(nome = "") {
  let soma = 0;
  for (let i = 0; i < nome.length; i += 1) soma += nome.charCodeAt(i);
  return paleta[soma % paleta.length];
}

/**
 * Avatar com foto e fallback de iniciais.
 * Se a imagem falhar ao carregar, cai automaticamente nas iniciais.
 *
 * A classe `spImagem` protege a foto contra o `img { max-width:60px !important }`
 * do global.css antigo (ver styles/tokens.css).
 */
export default function Avatar({ nome, foto, cor, tam = 38, className = "" }) {
  const [erro, setErro] = useState(false);
  const mostrarFoto = foto && !erro;

  return (
    <span
      className={`${estilos.avatar} ${className}`}
      style={{
        width: tam,
        height: tam,
        background: cor || corDoNome(nome),
        fontSize: Math.round(tam * 0.36),
      }}
      title={nome}
    >
      {mostrarFoto ? (
        <img
          className="spImagem"
          src={foto}
          alt=""
          onError={() => setErro(true)}
          loading="lazy"
        />
      ) : (
        iniciais(nome)
      )}
    </span>
  );
}
