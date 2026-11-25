import { useCallback, useEffect, useState } from "react";
import Cartao from "./Cartao";
import Dialogo from "./Dialogo.jsx";
import ItemLista, { Lista } from "./ItemLista";
import { Botao } from "./Controles";
import * as api from "../features/admin/admin.api.js";
import estilos from "../styles/adminConfig.module.css";
import dlg from "./ModalAgendamento.module.css";

/*
 * Catálogos da rede (Configurações > Cadastros): especialidades e tipos de
 * exame. Incluir e editar; nada é apagado, porque médicos, consultas e
 * exames apontam para eles. Os convênios ficam no modal do Financeiro.
 */

const CATALOGOS = {
  especialidades: {
    titulo: "Especialidades",
    icone: "estetoscopio",
    novo: "Nova especialidade",
    listar: api.listarEspecialidades,
    criar: api.criarEspecialidade,
    alterar: api.alterarEspecialidade,
    vazio: { nome: "", descricao: "" },
    campos: [
      { id: "nome", rotulo: "Nome", maximo: 80 },
      { id: "descricao", rotulo: "Descrição (opcional)", maximo: 200, linhas: 2 },
    ],
    descrever: (e) => e.descricao || e.slug,
    corpo: (f) => ({ nome: f.nome.trim(), descricao: f.descricao.trim() || null }),
  },
  tiposDeExame: {
    titulo: "Tipos de exame",
    icone: "frasco",
    novo: "Novo tipo de exame",
    listar: api.listarTiposDeExame,
    criar: api.criarTipoDeExame,
    alterar: api.alterarTipoDeExame,
    vazio: { nome: "", categoria: "", preparo: "", prazoResultadoDias: "" },
    campos: [
      { id: "nome", rotulo: "Nome", maximo: 120 },
      { id: "categoria", rotulo: "Categoria", maximo: 80 },
      { id: "preparo", rotulo: "Preparo (opcional)", maximo: 2000, linhas: 3 },
      { id: "prazoResultadoDias", rotulo: "Prazo do resultado em dias (opcional)", tipo: "number", min: 0, max: 365 },
    ],
    descrever: (t) => [t.categoria, t.prazoResultadoDias != null && `resultado em ${t.prazoResultadoDias} dia(s)`]
      .filter(Boolean).join(" · "),
    corpo: (f) => ({
      nome: f.nome.trim(),
      categoria: f.categoria.trim(),
      preparo: f.preparo.trim() || null,
      prazoResultadoDias: f.prazoResultadoDias === "" ? null : Number(f.prazoResultadoDias),
    }),
  },
};

/** Valor do item da API no formato do formulário (sem nulos nos campos). */
const paraFormulario = (catalogo, item) =>
  Object.fromEntries(Object.keys(catalogo.vazio).map((campo) => [campo, item?.[campo] == null ? "" : String(item[campo])]));

function Catalogo({ catalogo }) {
  const [itens, definirItens] = useState(null);
  const [erroLista, definirErroLista] = useState(null);
  const [editando, definirEditando] = useState(null); // { id?, form }
  const [erros, definirErros] = useState({});
  const [erroGeral, definirErroGeral] = useState(null);
  const [enviando, definirEnviando] = useState(false);

  const carregar = useCallback(
    (sinal) =>
      catalogo
        .listar({ sinal })
        .then((lista) => {
          if (!sinal?.aborted) {
            definirItens([...lista].sort((a, b) => a.nome.localeCompare(b.nome, "pt-BR")));
            definirErroLista(null);
          }
        })
        .catch((falha) => {
          if (!sinal?.aborted) definirErroLista(falha.message ?? "Não foi possível carregar.");
        }),
    [catalogo],
  );

  useEffect(() => {
    const controle = new AbortController();
    carregar(controle.signal);
    return () => controle.abort();
  }, [carregar]);

  const abrir = (item) => {
    definirErros({});
    definirErroGeral(null);
    definirEditando({ id: item?.id, form: paraFormulario(catalogo, item) });
  };

  const salvar = async (evento) => {
    evento.preventDefault();
    definirEnviando(true);
    definirErros({});
    definirErroGeral(null);
    try {
      const corpo = catalogo.corpo(editando.form);
      if (editando.id) await catalogo.alterar(editando.id, corpo);
      else await catalogo.criar(corpo);
      definirEditando(null);
      await carregar();
    } catch (falha) {
      definirErros(falha.campos ?? {});
      definirErroGeral(falha.message ?? "Não foi possível salvar.");
    } finally {
      definirEnviando(false);
    }
  };

  return (
    <Cartao
      titulo={catalogo.titulo}
      icone={catalogo.icone}
      extra={<Botao icone="mais" onClick={() => abrir(null)}>{catalogo.novo}</Botao>}
    >
      {erroLista ? (
        <p role="alert" className={dlg.erro}>{erroLista}</p>
      ) : !itens ? (
        <p className={dlg.ajuda}>Carregando…</p>
      ) : itens.length ? (
        <Lista>
          {itens.map((item) => (
            <ItemLista
              key={item.id}
              titulo={item.nome}
              descricao={catalogo.descrever(item)}
              direita={
                <Botao variante="secundario" icone="lapis" onClick={() => abrir(item)} aria-label={`Editar ${item.nome}`}>
                  Editar
                </Botao>
              }
            />
          ))}
        </Lista>
      ) : (
        <p className={dlg.ajuda}>Nenhum item cadastrado.</p>
      )}

      <Dialogo
        aberto={Boolean(editando)}
        aoFechar={() => definirEditando(null)}
        titulo={editando?.id ? `Editar: ${editando.form.nome}` : catalogo.novo}
        descricao="Médicos, consultas e exames já cadastrados continuam ligados a este item."
      >
        {editando && (
          <form className={dlg.formulario} onSubmit={salvar} noValidate>
            {catalogo.campos.map((campo) => {
              const id = `${catalogo.titulo}-${campo.id}`.replace(/\s+/g, "-");
              const props = {
                id,
                className: `${dlg.input} ${erros[campo.id] ? dlg.campoInvalido : ""}`,
                value: editando.form[campo.id],
                maxLength: campo.maximo,
                onChange: (e) => definirEditando((atual) => ({ ...atual, form: { ...atual.form, [campo.id]: e.target.value } })),
              };
              return (
                <div key={campo.id} className={dlg.campo}>
                  <label className={dlg.rotulo} htmlFor={id}>{campo.rotulo}</label>
                  {campo.linhas ? (
                    <textarea rows={campo.linhas} {...props} />
                  ) : (
                    <input type={campo.tipo ?? "text"} min={campo.min} max={campo.max} {...props} />
                  )}
                  {erros[campo.id] && <p className={dlg.erro}>{erros[campo.id]}</p>}
                </div>
              );
            })}
            {erroGeral && <p className={dlg.erro} role="alert">{erroGeral}</p>}
            <div className={dlg.acoes}>
              <button type="button" className={dlg.botaoSecundario} onClick={() => definirEditando(null)}>Cancelar</button>
              <button type="submit" className={dlg.botaoPrimario} disabled={enviando}>
                {enviando ? "Salvando…" : editando.id ? "Salvar alterações" : "Incluir"}
              </button>
            </div>
          </form>
        )}
      </Dialogo>
    </Cartao>
  );
}

export default function AdminConfigCadastros() {
  return (
    <div className={estilos.gradePrincipal}>
      <Catalogo catalogo={CATALOGOS.especialidades} />
      <Catalogo catalogo={CATALOGOS.tiposDeExame} />
    </div>
  );
}
