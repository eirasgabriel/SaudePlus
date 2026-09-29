import { useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";

import estilos from "../../../components/ModalAgendamento.module.css";
import proprios from "./ModalNovoUsuario.module.css";

/** Perfis que a administração cria. ADMIN só aparece para quem é ADMIN. */
const PERFIS = [
  { valor: "MEDICO", rotulo: "Médico(a)" },
  { valor: "RECEPCIONISTA", rotulo: "Recepcionista" },
  { valor: "ENFERMEIRO", rotulo: "Enfermeiro(a)" },
  { valor: "GESTOR", rotulo: "Gestor(a)" },
  { valor: "AGENTE", rotulo: "Agente comunitário" },
  { valor: "PACIENTE", rotulo: "Paciente" },
  { valor: "ADMIN", rotulo: "Administrador(a)" },
];

/** Médico e paciente têm cadastro próprio e não trocam de perfil (o servidor recusa com 422). */
const PERFIL_FIXO = new Set(["MEDICO", "PACIENTE"]);

const VAZIO = {
  nomeCompleto: "",
  email: "",
  telefone: "",
  cpf: "",
  papel: "RECEPCIONISTA",
  crm: "",
  crmUf: "",
  valorConsulta: "",
  bio: "",
  especialidadeIds: [],
  unidadeIds: [],
};

/** Conta da API (`UsuarioAdminResposta`) → formulário. */
function doUsuario(u) {
  return {
    nomeCompleto: u.nome ?? "",
    email: u.email ?? "",
    telefone: u.telefone ?? "",
    cpf: u.cpf ?? "",
    papel: u.papel,
    crm: u.medico?.crm ?? "",
    crmUf: u.medico?.crmUf ?? "",
    valorConsulta: u.medico?.valorConsulta ?? "",
    bio: u.medico?.bio ?? "",
    especialidadeIds: u.medico?.especialidades?.map((e) => e.id) ?? [],
    unidadeIds: u.medico?.unidades?.map((un) => un.id) ?? [],
  };
}

/** Erros da API por campo (`medico.crm` vira `crm`) para destacar o input certo. */
function errosDoServidor(campos = {}) {
  return Object.fromEntries(Object.entries(campos).map(([campo, msg]) => [campo.replace(/^medico\./, ""), msg]));
}

/**
 * Cadastro e edição de conta pela administração.
 *
 * Sem `usuario`, cria: não pede senha, a pessoa recebe um convite por e-mail.
 * Com `usuario`, edita: o e-mail não muda, e médico e paciente não trocam de
 * perfil. Para médico, pede CRM, especialidades, unidades, valor e apresentação.
 *
 * `aoCriar(dados)` devolve uma promessa; se falhar, o modal mostra os erros
 * (por campo, quando a API os informa) e continua aberto.
 */
export default function ModalNovoUsuario({
  aberto,
  aoFechar,
  aoCriar,
  usuario = null,
  especialidades = [],
  unidades = [],
  podeCriarAdmin,
}) {
  const prefixo = `nu-${useId().replace(/[^a-zA-Z0-9_-]/g, "")}`;
  const [formulario, setFormulario] = useState(VAZIO);
  const [erros, setErros] = useState({});
  const [erroGeral, setErroGeral] = useState(null);
  const [enviando, setEnviando] = useState(false);
  const refPrimeiro = useRef(null);
  const editando = Boolean(usuario);

  const [abertoAnterior, setAbertoAnterior] = useState(aberto);
  if (aberto !== abertoAnterior) {
    setAbertoAnterior(aberto);
    if (aberto) {
      setFormulario(usuario ? doUsuario(usuario) : VAZIO);
      setErros({});
      setErroGeral(null);
    }
  }

  useEffect(() => {
    if (!aberto) return undefined;
    const foco = window.setTimeout(() => refPrimeiro.current?.focus(), 0);
    const aoTeclar = (evento) => {
      if (evento.key === "Escape") aoFechar?.();
    };
    document.addEventListener("keydown", aoTeclar);
    return () => {
      window.clearTimeout(foco);
      document.removeEventListener("keydown", aoTeclar);
    };
  }, [aberto, aoFechar]);

  if (!aberto) return null;

  const medico = formulario.papel === "MEDICO";
  const perfilFixo = editando && PERFIL_FIXO.has(usuario.papel);
  const perfis = PERFIS.filter((p) => {
    if (p.valor === "ADMIN" && !podeCriarAdmin) return false;
    if (perfilFixo) return p.valor === usuario.papel;
    return !editando || !PERFIL_FIXO.has(p.valor);
  });

  const alterar = (campo, valor) => {
    setFormulario((atual) => ({ ...atual, [campo]: valor }));
    setErros((atuais) => ({ ...atuais, [campo]: undefined }));
  };

  const alternar = (campo, id) => {
    setFormulario((atual) => ({
      ...atual,
      [campo]: atual[campo].includes(id) ? atual[campo].filter((x) => x !== id) : [...atual[campo], id],
    }));
    setErros((atuais) => ({ ...atuais, [campo]: undefined }));
  };

  const enviar = async (evento) => {
    evento.preventDefault();
    if (enviando) return;
    const locais = {};
    if (formulario.nomeCompleto.trim().length < 3) locais.nomeCompleto = "Informe o nome completo.";
    if (!editando && !/^\S+@\S+\.\S+$/.test(formulario.email.trim())) locais.email = "Informe um e-mail válido.";
    if (medico && !formulario.crm.trim()) locais.crm = "Informe o CRM.";
    if (medico && !/^[A-Za-z]{2}$/.test(formulario.crmUf.trim())) locais.crmUf = "Use a sigla do estado.";
    if (medico && formulario.especialidadeIds.length === 0) locais.especialidadeIds = "Escolha ao menos uma.";
    if (Object.keys(locais).length) {
      setErros(locais);
      return;
    }

    setEnviando(true);
    setErroGeral(null);
    try {
      await aoCriar({
        nomeCompleto: formulario.nomeCompleto.trim(),
        email: editando ? undefined : formulario.email.trim(),
        telefone: formulario.telefone.trim() || undefined,
        cpf: formulario.cpf.trim() || undefined,
        papel: formulario.papel,
        medico: medico
          ? {
              crm: formulario.crm.trim(),
              crmUf: formulario.crmUf.trim().toUpperCase(),
              especialidadeIds: formulario.especialidadeIds,
              unidadeIds: formulario.unidadeIds,
              valorConsulta: formulario.valorConsulta !== "" ? Number(formulario.valorConsulta) : undefined,
              bio: formulario.bio.trim() || undefined,
            }
          : undefined,
      });
      aoFechar?.();
    } catch (erro) {
      setErros(errosDoServidor(erro?.campos));
      setErroGeral(erro?.message ?? (editando ? "Não foi possível salvar a conta." : "Não foi possível criar a conta."));
    } finally {
      setEnviando(false);
    }
  };

  const campo = (nome, rotulo, props = {}) => (
    <div className={estilos.campo}>
      <label className={estilos.rotulo} htmlFor={`${prefixo}-${nome}`}>{rotulo}</label>
      <input
        id={`${prefixo}-${nome}`}
        className={`${estilos.input} ${erros[nome] ? estilos.campoInvalido : ""}`}
        value={formulario[nome]}
        onChange={(e) => alterar(nome, e.target.value)}
        aria-invalid={erros[nome] ? "true" : undefined}
        aria-describedby={erros[nome] ? `${prefixo}-${nome}-erro` : undefined}
        {...props}
      />
      {erros[nome] && <p id={`${prefixo}-${nome}-erro`} className={estilos.erro}>{erros[nome]}</p>}
    </div>
  );

  const listaDeMarcar = (nome, legenda, itens) => (
    <fieldset className={estilos.campo}>
      <legend className={estilos.rotulo}>{legenda}</legend>
      <div className={proprios.opcoes}>
        {itens.map((item) => (
          <label key={item.id} className={proprios.opcao}>
            <input type="checkbox" checked={formulario[nome].includes(item.id)} onChange={() => alternar(nome, item.id)} />
            {item.nome}
          </label>
        ))}
      </div>
      {erros[nome] && <p className={estilos.erro}>{erros[nome]}</p>}
    </fieldset>
  );

  return createPortal(
    <div
      className={estilos.fundo}
      onMouseDown={(evento) => {
        if (evento.target === evento.currentTarget) aoFechar?.();
      }}
    >
      <div className={estilos.dialogo} role="dialog" aria-modal="true" aria-labelledby={`${prefixo}-titulo`}>
        <header className={estilos.cabecalho}>
          <div className={estilos.textoCabecalho}>
            <h2 id={`${prefixo}-titulo`} className={estilos.titulo}>{editando ? "Editar usuário" : "Novo usuário"}</h2>
            <p className={estilos.descricao}>
              {editando ? "O e-mail de acesso não muda." : "A pessoa recebe um e-mail para definir a própria senha."}
            </p>
          </div>
          <button type="button" className={estilos.botaoFechar} onClick={aoFechar} aria-label="Fechar">×</button>
        </header>

        <form className={estilos.formulario} onSubmit={enviar} noValidate>
          <div className={estilos.campo}>
            <label className={estilos.rotulo} htmlFor={`${prefixo}-papel`}>Perfil</label>
            <select
              id={`${prefixo}-papel`}
              ref={refPrimeiro}
              className={estilos.select}
              value={formulario.papel}
              disabled={perfilFixo}
              onChange={(e) => alterar("papel", e.target.value)}
            >
              {perfis.map((p) => <option key={p.valor} value={p.valor}>{p.rotulo}</option>)}
            </select>
          </div>
          {campo("nomeCompleto", "Nome completo", { autoComplete: "off" })}
          {campo("email", "E-mail", { type: "email", autoComplete: "off", disabled: editando })}
          <div className={proprios.linha}>
            {campo("telefone", "Telefone (opcional)", { inputMode: "tel" })}
            {campo("cpf", "CPF (opcional)", { inputMode: "numeric" })}
          </div>

          {medico && (
            <>
              <div className={proprios.linha}>
                {campo("crm", "CRM")}
                {campo("crmUf", "UF do CRM", { maxLength: 2 })}
                {campo("valorConsulta", "Valor da consulta (R$)", { type: "number", min: 0, step: "0.01" })}
              </div>
              {listaDeMarcar("especialidadeIds", "Especialidades", especialidades)}
              {listaDeMarcar("unidadeIds", "Unidades onde atende", unidades)}
              <div className={estilos.campo}>
                <label className={estilos.rotulo} htmlFor={`${prefixo}-bio`}>Apresentação (opcional)</label>
                <textarea
                  id={`${prefixo}-bio`}
                  className={estilos.input}
                  rows={3}
                  maxLength={2000}
                  value={formulario.bio}
                  onChange={(e) => alterar("bio", e.target.value)}
                />
              </div>
            </>
          )}

          {erroGeral && <p className={estilos.erro} role="alert">{erroGeral}</p>}

          <div className={estilos.acoes}>
            <button type="button" className={estilos.botaoSecundario} onClick={aoFechar}>Cancelar</button>
            <button type="submit" className={estilos.botaoPrimario} disabled={enviando} aria-busy={enviando}>
              {enviando ? "Salvando…" : editando ? "Salvar alterações" : "Criar e enviar convite"}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body,
  );
}
