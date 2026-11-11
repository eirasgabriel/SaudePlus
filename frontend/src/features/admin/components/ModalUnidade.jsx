import { useState } from "react";

import Dialogo from "../../../components/Dialogo.jsx";
import dlg from "../../../components/ModalAgendamento.module.css";
import proprios from "./ModalNovoUsuario.module.css";

const CAMPOS = {
  nome: "",
  endereco: "",
  bairro: "",
  cidade: "",
  uf: "",
  telefone: "",
  horarioFuncionamento: "",
  mapUrl: "",
  cnpj: "",
  email: "",
  emailLogin: "",
  senhaLogin: "",
  confirmarSenha: "",
};

/** Dados da API → formulário (nulos viram texto vazio). */
function doFormulario(unidade) {
  return Object.fromEntries(Object.keys(CAMPOS).map((campo) => [campo, unidade?.[campo] ?? ""]));
}

/**
 * Cadastro e edição de unidade. `unidade` preenchida = edição.
 * `aoSalvar(dados)` devolve uma promessa; se falhar, os erros por campo da
 * API aparecem no input certo e o modal continua aberto.
 */
export default function ModalUnidade({ aberto, unidade, focar, aoFechar, aoSalvar }) {
  return (
    <Dialogo
      aberto={aberto}
      aoFechar={aoFechar}
      titulo={unidade ? "Editar clínica" : "Nova clínica"}
      descricao="Só unidades ativas aparecem na busca e recebem agendamentos."
      largura={640}
    >
      {/* Remonta a cada abertura: o formulário começa do registro escolhido. */}
      {aberto && <Formulario key={unidade?.id ?? "nova"} unidade={unidade} focar={focar} aoFechar={aoFechar} aoSalvar={aoSalvar} />}
    </Dialogo>
  );
}

function Formulario({ unidade, focar, aoFechar, aoSalvar }) {
  const [form, setForm] = useState(() => doFormulario(unidade));
  const [erros, setErros] = useState({});
  const [erroGeral, setErroGeral] = useState(null);
  const [enviando, setEnviando] = useState(false);

  const alterar = (campo, valor) => {
    setForm((atual) => ({ ...atual, [campo]: valor }));
    setErros((atuais) => ({ ...atuais, [campo]: undefined }));
  };

  const enviar = async (evento) => {
    evento.preventDefault();
    const locais = {};
    if (!form.nome.trim()) locais.nome = "Informe o nome.";
    if (!form.endereco.trim()) locais.endereco = "Informe o endereço.";
    if (!form.cidade.trim()) locais.cidade = "Informe a cidade.";
    if (!/^[A-Za-z]{2}$/.test(form.uf.trim())) locais.uf = "Use a sigla do estado.";
    if (!form.emailLogin.trim()) locais.emailLogin = "Informe o e-mail de login.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.emailLogin.trim())) locais.emailLogin = "Informe um e-mail válido.";
    if ((!unidade?.emailLogin || form.senhaLogin) && form.senhaLogin.length < 8) locais.senhaLogin = "Use pelo menos 8 caracteres.";
    if (new TextEncoder().encode(form.senhaLogin).length > 72) locais.senhaLogin = "A senha deve ter no máximo 72 bytes.";
    if (form.senhaLogin !== form.confirmarSenha) locais.confirmarSenha = "As senhas não conferem.";
    if (Object.keys(locais).length) {
      setErros(locais);
      return;
    }
    setEnviando(true);
    setErroGeral(null);
    try {
      const dados = Object.fromEntries(Object.entries(form).map(([campo, valor]) => [campo, valor.trim() || undefined]));
      delete dados.confirmarSenha;
      dados.senhaLogin = form.senhaLogin || undefined;
      await aoSalvar({ ...dados, uf: dados.uf.toUpperCase() });
      aoFechar();
    } catch (falha) {
      setErros(falha?.campos ?? {});
      setErroGeral(falha?.message ?? "Não foi possível salvar a clínica.");
    } finally {
      setEnviando(false);
    }
  };

  const campo = (nome, rotulo, props = {}) => (
    <div className={dlg.campo}>
      <label className={dlg.rotulo} htmlFor={`unidade-${nome}`}>{rotulo}</label>
      <input
        id={`unidade-${nome}`}
        className={`${dlg.input} ${erros[nome] ? dlg.campoInvalido : ""}`}
        value={form[nome]}
        onChange={(e) => alterar(nome, e.target.value)}
        aria-invalid={erros[nome] ? "true" : undefined}
        data-foco-inicial={focar === nome || undefined}
        {...props}
      />
      {erros[nome] && <p className={dlg.erro}>{erros[nome]}</p>}
    </div>
  );

  return (
    <form className={dlg.formulario} onSubmit={enviar} noValidate>
      {campo("nome", "Nome", { maxLength: 120 })}
      <div className={proprios.linha}>
        {campo("cnpj", "CNPJ (opcional)", { inputMode: "numeric", maxLength: 18 })}
        {campo("email", "E-mail de contato (opcional)", { type: "email", maxLength: 180 })}
      </div>
      {campo("endereco", "Endereço", { maxLength: 200 })}
      <div className={proprios.linha}>
        {campo("bairro", "Bairro (opcional)", { maxLength: 80 })}
        {campo("cidade", "Cidade", { maxLength: 80 })}
        {campo("uf", "UF", { maxLength: 2 })}
      </div>
      <div className={proprios.linha}>
        {campo("telefone", "Telefone (opcional)", { inputMode: "tel", maxLength: 20 })}
        {campo("horarioFuncionamento", "Funcionamento (opcional)", { maxLength: 200, placeholder: "Segunda a sexta, 07h às 17h" })}
      </div>
      {campo("mapUrl", "Link do mapa (https, opcional)", { type: "url", maxLength: 500 })}
      <h3>Acesso da clínica</h3>
      <p>A clínica entra com este e-mail e visualiza apenas os dados da sua unidade. Trocar o e-mail muda o login a partir do próximo acesso.</p>
      {campo("emailLogin", "E-mail de login", { type: "email", autoComplete: "off", maxLength: 180 })}
      <div className={proprios.linha}>
        {campo("senhaLogin", unidade?.emailLogin ? "Nova senha (opcional)" : "Senha de acesso", { type: "password", autoComplete: "new-password", maxLength: 72 })}
        {campo("confirmarSenha", "Confirmar senha", { type: "password", autoComplete: "new-password", maxLength: 72 })}
      </div>
      {unidade?.emailLogin && <p>Deixe a senha em branco para manter a senha atual.</p>}
      {erroGeral && <p className={dlg.erro} role="alert">{erroGeral}</p>}
      <div className={dlg.acoes}>
        <button type="button" className={dlg.botaoSecundario} onClick={aoFechar}>Cancelar</button>
        <button type="submit" className={dlg.botaoPrimario} disabled={enviando}>{enviando ? "Salvando…" : "Salvar"}</button>
      </div>
    </form>
  );
}
