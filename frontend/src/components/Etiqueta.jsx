import estilos from "./Etiqueta.module.css";

/**
 * Selo de status arredondado.
 * Variantes: sucesso | info | erro | aviso | roxo | ciano | rosa | neutro
 * `comPonto` adiciona o marcador circular antes do texto.
 */
export default function Etiqueta({
  children,
  variante = "neutro",
  comPonto = false,
  className = "",
}) {
  return (
    <span
      className={`${estilos.etiqueta} ${estilos[variante] || estilos.neutro} ${className}`}
    >
      {comPonto && <span className={estilos.ponto} aria-hidden="true" />}
      {children}
    </span>
  );
}
