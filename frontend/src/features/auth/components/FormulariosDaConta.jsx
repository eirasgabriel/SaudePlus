import { useState } from "react";

import { CampoDaTela, CartaoDaTela, Mensagem } from "../../../components/Telas.jsx";
import estilos from "../../../styles/telas.module.css";
import { atualizarPerfil, trocarSenha } from "../auth.api.js";
import { useAuth } from "../auth.context.js";

/**
 * Nome, telefone e foto de quem está logado (`PUT /api/auth/perfil`). Serve a
 * qualquer perfil; o cabeçalho troca na hora porque o AuthProvider é avisado.
 */
export function FormularioDaConta() {
  const { usuario, atualizarUsuario } = useAuth();
  const [dados, setDados] = useState(() => ({
    nomeCompleto: usuario?.nomeCompleto ?? "",
    telefone: usuario?.telefone ?? "",
    fotoUrl: usuario?.fotoUrl ?? "",
  }));
  const [erros, setErros] = useState({});
  const [retorno, setRetorno] = useState(null);
  const [enviando, setEnviando] = useState(false);

  const alterar = (campo, valor) => {
    setDados((atuais) => ({ ...atuais, [campo]: valor }));
    setErros((atuais) => ({ ...atuais, [campo]: undefined }));
  };

  const salvar = async (evento) => {
    evento.preventDefault();
    setEnviando(true);
    setRetorno(null);
    try {
      const perfil = await atualizarPerfil({
        nomeCompleto: dados.nomeCompleto.trim(),
        telefone: dados.telefone.trim() || undefined,
        fotoUrl: dados.fotoUrl.trim() || undefined,
      });
      atualizarUsuario(perfil);
      setErros({});
      setRetorno({ tom: "sucesso", texto: "Dados da conta salvos." });
    } catch (falha) {
      setErros(falha.campos ?? {});
      setRetorno({ tom: "erro", texto: falha.message });
    } finally {
      setEnviando(false);
    }
  };

  return (
    <CartaoDaTela titulo="Dados da conta">
      <form className={estilos.formulario} onSubmit={salvar} noValidate>
        <div className={estilos.grade2}>
          <CampoDaTela rotulo="Nome completo" erro={erros.nomeCompleto}>
            {(props) => <input maxLength={120} value={dados.nomeCompleto} onChange={(e) => alterar("nomeCompleto", e.target.value)} {...props} />}
          </CampoDaTela>
          <CampoDaTela rotulo="Telefone" erro={erros.telefone}>
            {(props) => <input inputMode="tel" maxLength={20} value={dados.telefone} onChange={(e) => alterar("telefone", e.target.value)} {...props} />}
          </CampoDaTela>
        </div>
        <CampoDaTela rotulo="Endereço da foto (https, opcional)" erro={erros.fotoUrl}>
          {(props) => <input type="url" maxLength={500} value={dados.fotoUrl} onChange={(e) => alterar("fotoUrl", e.target.value)} {...props} />}
        </CampoDaTela>
        <p className={estilos.itemSecundario}>E-mail de acesso: {usuario?.email}. Ele não muda por aqui.</p>
        {retorno && <Mensagem tom={retorno.tom}>{retorno.texto}</Mensagem>}
        <div className={estilos.botoes}>
          <button type="submit" className={estilos.botao} disabled={enviando}>{enviando ? "Salvando…" : "Salvar"}</button>
        </div>
      </form>
    </CartaoDaTela>
  );
}

/** Troca de senha, pedindo a atual. As regras (8 a 72 caracteres) são as do cadastro. */
export function FormularioDeSenha() {
  const [dados, setDados] = useState({ senhaAtual: "", novaSenha: "", confirmacao: "" });
  const [erros, setErros] = useState({});
  const [retorno, setRetorno] = useState(null);
  const [enviando, setEnviando] = useState(false);

  const alterar = (campo, valor) => {
    setDados((atuais) => ({ ...atuais, [campo]: valor }));
    setErros((atuais) => ({ ...atuais, [campo]: undefined }));
  };

  const salvar = async (evento) => {
    evento.preventDefault();
    const locais = {};
    if (!dados.senhaAtual) locais.senhaAtual = "Informe a senha atual.";
    if (dados.novaSenha.length < 8 || dados.novaSenha.length > 72) locais.novaSenha = "A senha deve ter entre 8 e 72 caracteres.";
    if (dados.confirmacao !== dados.novaSenha) locais.confirmacao = "As senhas não conferem.";
    if (Object.keys(locais).length) {
      setErros(locais);
      return;
    }
    setEnviando(true);
    setRetorno(null);
    try {
      await trocarSenha({ senhaAtual: dados.senhaAtual, novaSenha: dados.novaSenha });
      setDados({ senhaAtual: "", novaSenha: "", confirmacao: "" });
      setErros({});
      setRetorno({ tom: "sucesso", texto: "Senha alterada." });
    } catch (falha) {
      setErros(falha.campos ?? {});
      setRetorno({ tom: "erro", texto: falha.message });
    } finally {
      setEnviando(false);
    }
  };

  const campo = (nome, rotulo, autoComplete) => (
    <CampoDaTela rotulo={rotulo} erro={erros[nome]}>
      {(props) => (
        <input type="password" autoComplete={autoComplete} value={dados[nome]} onChange={(e) => alterar(nome, e.target.value)} {...props} />
      )}
    </CampoDaTela>
  );

  return (
    <CartaoDaTela titulo="Senha">
      <form className={estilos.formulario} onSubmit={salvar} noValidate>
        <div className={estilos.grade2}>
          {campo("senhaAtual", "Senha atual", "current-password")}
          {campo("novaSenha", "Nova senha", "new-password")}
          {campo("confirmacao", "Repita a nova senha", "new-password")}
        </div>
        {retorno && <Mensagem tom={retorno.tom}>{retorno.texto}</Mensagem>}
        <div className={estilos.botoes}>
          <button type="submit" className={estilos.botao} disabled={enviando}>{enviando ? "Salvando…" : "Trocar senha"}</button>
        </div>
      </form>
    </CartaoDaTela>
  );
}
