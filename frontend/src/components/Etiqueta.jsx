import estilos from "./Etiqueta.module.css";

/**
 * Selo de status.
 * Variantes: sucesso | info | erro | aviso | roxo | ciano | rosa | neutro
 * `comPonto` adiciona o marcador antes do texto.
 * `status` (opcional, chave de agendamento: pendente, confirmada, aguardando,
 * em_andamento, realizada, cancelada, faltou…) troca o marcador pelo glifo de
 * progresso — o disco que se preenche conforme o atendimento avança.
 */
export default function Etiqueta({
  children,
  variante = "neutro",
  comPonto = false,
  status,
  className = "",
}) {
  const comGlifo = Boolean(status);
  return (
    <span
      className={`${estilos.etiqueta} ${estilos[variante] || estilos.neutro} ${className}`}
      data-status={status}
    >
      {(comPonto || comGlifo) && (
        <span className={comGlifo ? estilos.glifo : estilos.ponto} aria-hidden="true" />
      )}
      {children}
    </span>
  );
}
