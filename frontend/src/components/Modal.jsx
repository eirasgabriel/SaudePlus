import { useEffect } from "react";
import Icone from "./Icone";
import { Botao } from "./Controles";
import estilos from "./Modal.module.css";

/**
 * Janela modal genérica usada pelos formulários administrativos
 * (criar/editar/ver usuário, clínica, agendamento...).
 *
 * <Modal titulo="Novo usuário" aoFechar={fecharModal} rodape={...}>
 *   conteúdo do formulário
 * </Modal>
 */
export default function Modal({
  titulo,
  subtitulo,
  aoFechar,
  erro,
  children,
  rodape,
  largura,
}) {
  useEffect(() => {
    function aoTeclar(evento) {
      if (evento.key === "Escape") aoFechar?.();
    }
    document.addEventListener("keydown", aoTeclar);
    return () => document.removeEventListener("keydown", aoTeclar);
  }, [aoFechar]);

  return (
    <div
      className={estilos.overlay}
      onMouseDown={(evento) => {
        if (evento.target === evento.currentTarget) aoFechar?.();
      }}
    >
      <div
        className={estilos.caixa}
        style={largura ? { maxWidth: largura } : undefined}
        role="dialog"
        aria-modal="true"
        aria-label={titulo}
      >
        <div className={estilos.topo}>
          <div>
            <h2 className={estilos.titulo}>{titulo}</h2>
            {subtitulo && <p className={estilos.subtitulo}>{subtitulo}</p>}
          </div>
          <button
            type="button"
            className={estilos.fechar}
            onClick={aoFechar}
            aria-label="Fechar"
          >
            <Icone nome="alertaX" tam={16} />
          </button>
        </div>

        <div className={estilos.corpo}>
          {erro && <div className={estilos.erro}>{erro}</div>}
          {children}
        </div>

        {rodape && <div className={estilos.rodape}>{rodape}</div>}
      </div>
    </div>
  );
}

/** Grade de duas colunas para pares de campos dentro do modal. */
export function GradeModal({ children }) {
  return <div className={estilos.grade2}>{children}</div>;
}

/** Par de botões padrão (Cancelar / Confirmar) para o rodapé do modal. */
export function RodapeModal({
  aoCancelar,
  aoConfirmar,
  rotuloConfirmar = "Salvar",
  carregando = false,
  variantePerigo = false,
}) {
  return (
    <>
      <Botao variante="secundario" onClick={aoCancelar} disabled={carregando}>
        Cancelar
      </Botao>
      <Botao
        variante={variantePerigo ? "perigo" : "primario"}
        onClick={aoConfirmar}
        disabled={carregando}
      >
        {carregando ? "Aguarde..." : rotuloConfirmar}
      </Botao>
    </>
  );
}
