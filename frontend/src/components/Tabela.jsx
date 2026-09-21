import Icone from "./Icone";
import estilos from "./Tabela.module.css";

/* =========================================================
   Casca da tabela
   ========================================================= */
export function Tabela({ colunas, children, vazio = "Nenhum registro encontrado." }) {
  const semLinhas = !children || (Array.isArray(children) && children.length === 0);

  return (
    <div className={estilos.wrap}>
      <table className={estilos.tabela}>
        <thead>
          <tr>
            {colunas.map((col) => (
              <th key={col} scope="col">
                {col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {semLinhas ? (
            <tr>
              <td colSpan={colunas.length} className={estilos.vazio}>
                {vazio}
              </td>
            </tr>
          ) : (
            children
          )}
        </tbody>
      </table>
    </div>
  );
}

/* =========================================================
   Célula com linha principal + secundária
   ========================================================= */
export function CelulaDupla({ principal, secundario, icone, avatar }) {
  const texto = (
    <div style={{ minWidth: 0 }}>
      <div className={estilos.principal}>{principal}</div>
      {secundario && <div className={estilos.secundario}>{secundario}</div>}
    </div>
  );

  if (!icone && !avatar) return texto;

  return (
    <div className={estilos.comIcone}>
      {avatar}
      {icone && (
        <span className={estilos.iconeCelula}>
          <Icone nome={icone} tam={17} />
        </span>
      )}
      {texto}
    </div>
  );
}

/** Texto de célula precedido por um ícone pequeno (telefone, endereço...). */
export function CelulaIcone({ icone, children }) {
  return (
    <span className={estilos.linhaIcone}>
      <Icone nome={icone} tam={14} />
      {children}
    </span>
  );
}

/* =========================================================
   Ações da linha (ver / editar / excluir)
   ========================================================= */
export function AcoesLinha({ acoes = [] }) {
  return (
    <div className={estilos.acoes}>
      {acoes.map((acao) => (
        <button
          key={acao.rotulo}
          type="button"
          className={`${estilos.acaoBtn} ${
            acao.tom === "perigo"
              ? estilos.acaoPerigo
              : acao.tom === "neutra"
                ? estilos.acaoNeutra
                : ""
          }`}
          title={acao.rotulo}
          aria-label={acao.rotulo}
          onClick={acao.aoClicar}
        >
          <Icone nome={acao.icone} tam={16} />
        </button>
      ))}
    </div>
  );
}

/* =========================================================
   Rodapé com contagem e paginação
   ========================================================= */
export function RodapeTabela({ pagina, totalPaginas, total, mostrando, aoMudarPagina }) {
  const paginas = Array.from({ length: totalPaginas }, (_, i) => i + 1);

  return (
    <div className={estilos.rodape}>
      <span className={estilos.contagem}>
        {total === 0
          ? "Nenhum registro"
          : `Mostrando ${mostrando.inicio} a ${mostrando.fim} de ${total} registros`}
      </span>

      {totalPaginas > 1 && (
        <nav className={estilos.paginacao} aria-label="Paginação">
          <button
            type="button"
            className={estilos.pagBtn}
            disabled={pagina === 1}
            onClick={() => aoMudarPagina(pagina - 1)}
            aria-label="Página anterior"
          >
            <Icone nome="chevronEsquerda" tam={15} />
          </button>

          {paginas.map((n) => (
            <button
              key={n}
              type="button"
              className={`${estilos.pagBtn} ${n === pagina ? estilos.pagAtiva : ""}`}
              onClick={() => aoMudarPagina(n)}
              aria-current={n === pagina ? "page" : undefined}
            >
              {n}
            </button>
          ))}

          <button
            type="button"
            className={estilos.pagBtn}
            disabled={pagina === totalPaginas}
            onClick={() => aoMudarPagina(pagina + 1)}
            aria-label="Próxima página"
          >
            <Icone nome="chevronDireita" tam={15} />
          </button>
        </nav>
      )}
    </div>
  );
}
