import { useId } from "react";

import estilos from "../styles/telas.module.css";

/* Peças das telas da área logada do médico e do paciente. Diferente dos
   painéis antigos, estas telas não têm mocks: sem API, mostram o erro e o
   botão de tentar de novo. As classes soltas (botões, listas) vêm de
   styles/telas.module.css, importado direto por quem usa. */

export function CabecalhoDaTela({ titulo, subtitulo, children }) {
  return (
    <div className={estilos.cabecalho}>
      <div>
        <h1 className={estilos.titulo}>{titulo}</h1>
        {subtitulo && <p className={estilos.subtitulo}>{subtitulo}</p>}
      </div>
      {children}
    </div>
  );
}

export function CartaoDaTela({ titulo, extra, children, ...resto }) {
  return (
    <section className={estilos.cartao} {...resto}>
      {(titulo || extra) && (
        <div className={estilos.cartaoTopo}>
          {titulo && <h2 className={estilos.cartaoTitulo}>{titulo}</h2>}
          {extra}
        </div>
      )}
      {children}
    </section>
  );
}

/** `tom`: "sucesso" | "erro" | "info". Erro é anunciado na hora pelo leitor de tela. */
export function Mensagem({ tom = "info", children }) {
  if (!children) return null;
  return (
    <p className={`${estilos.mensagem} ${estilos[tom]}`} role={tom === "erro" ? "alert" : "status"}>
      {children}
    </p>
  );
}

/**
 * Enquanto carrega, o texto de espera; se falhou, o erro com "Tentar de
 * novo"; com dados, o conteúdo. `estado` é o retorno de `useDadosDaApi`.
 */
export function ConteudoCarregado({ estado, carregando = "Carregando…", children }) {
  if (estado.origem === "carregando") {
    return <p className={estilos.carregando} role="status">{carregando}</p>;
  }
  if (estado.origem !== "api") {
    return (
      <div className={estilos.botoes}>
        <Mensagem tom="erro">{estado.erro?.message ?? "Não foi possível carregar."}</Mensagem>
        <button type="button" className={estilos.botaoSecundario} onClick={estado.recarregar}>
          Tentar de novo
        </button>
      </div>
    );
  }
  return children;
}

/** Paginação das listas da API (`pagina` começa em 0, como no back-end). */
export function Paginacao({ pagina, totalPaginas, totalElementos, aoMudar }) {
  if (!totalPaginas || totalPaginas <= 1) {
    return totalElementos != null ? <p className={estilos.paginacao}>{totalElementos} registro(s)</p> : null;
  }
  return (
    <nav className={estilos.paginacao} aria-label="Paginação">
      <span>
        Página {pagina + 1} de {totalPaginas} · {totalElementos} registro(s)
      </span>
      <span className={estilos.botoes}>
        <button type="button" className={estilos.botaoSecundario} disabled={pagina === 0} onClick={() => aoMudar(pagina - 1)}>
          Anterior
        </button>
        <button
          type="button"
          className={estilos.botaoSecundario}
          disabled={pagina + 1 >= totalPaginas}
          onClick={() => aoMudar(pagina + 1)}
        >
          Próxima
        </button>
      </span>
    </nav>
  );
}

/**
 * Campo rotulado com erro por campo. `children` recebe as props do controle
 * (`id`, `aria-invalid`, `aria-describedby`, `className`) para usar em
 * input, select ou textarea.
 */
export function CampoDaTela({ rotulo, erro, largo = false, tipo = "input", children }) {
  const id = `ct-${useId().replace(/[^a-zA-Z0-9_-]/g, "")}`;
  const classe = `${estilos[tipo] ?? estilos.input} ${erro ? estilos.invalido : ""}`;
  return (
    <div className={`${estilos.campo} ${largo ? estilos.campoLargo : ""}`}>
      <label className={estilos.rotulo} htmlFor={id}>{rotulo}</label>
      {children({
        id,
        className: classe,
        "aria-invalid": erro ? "true" : undefined,
        "aria-describedby": erro ? `${id}-erro` : undefined,
      })}
      {erro && <p id={`${id}-erro`} className={estilos.erroCampo}>{erro}</p>}
    </div>
  );
}

/** Pares rótulo/valor; valor vazio vira "—". */
export function Dados({ itens }) {
  return (
    <dl className={estilos.dados}>
      {itens.map(([rotulo, valor]) => (
        <div key={rotulo}>
          <dt>{rotulo}</dt>
          <dd>{valor === null || valor === undefined || valor === "" ? "—" : valor}</dd>
        </div>
      ))}
    </dl>
  );
}
