import { useId, useRef, useState } from "react";

import { CampoDaTela, CartaoDaTela, Mensagem } from "../../../components/Telas.jsx";
import estilos from "../../../styles/telas.module.css";
import { enderecoDaApi } from "../../../services/http.js";
import { TAMANHO_MAXIMO_DA_FOTO, atualizarPerfil, enviarFotoDePerfil, trocarSenha } from "../auth.api.js";
import { useAuth } from "../auth.context.js";

/** Formatos aceitos na foto de perfil (o back-end confere de novo pelos bytes). */
const TIPOS_DA_FOTO = ["image/png", "image/jpeg", "image/webp"];
const ACEITA_FOTO = ".png,.jpg,.jpeg,.webp,image/png,image/jpeg,image/webp";

/** PNG, JPG ou WebP: confere a extensão e, quando o navegador informa, o tipo. */
function ehImagemAceita(arquivo) {
  const extensaoOk = /\.(png|jpe?g|webp)$/i.test(arquivo.name);
  const tipoOk = !arquivo.type || TIPOS_DA_FOTO.includes(arquivo.type);
  return extensaoOk && tipoOk;
}

/**
 * Nome, telefone e foto de quem está logado (`PUT /api/auth/perfil`). Serve a
 * qualquer perfil; o cabeçalho troca na hora porque o AuthProvider é avisado.
 *
 * A foto vem de um endereço https ou de uma imagem (PNG, JPG ou WebP) enviada do
 * computador (`POST /api/auth/perfil/foto`, gravada na hora).
 * `comOpcaoDoPainel` mostra a caixa "Mostrar minha foto na página principal".
 */
export function FormularioDaConta({ comOpcaoDoPainel = false }) {
  const { usuario, atualizarUsuario } = useAuth();
  const [dados, setDados] = useState(() => ({
    nomeCompleto: usuario?.nomeCompleto ?? "",
    telefone: usuario?.telefone ?? "",
    fotoUrl: usuario?.fotoUrl ?? "",
    exibirFotoNoPainel: Boolean(usuario?.exibirFotoNoPainel),
  }));
  const [erros, setErros] = useState({});
  const [retorno, setRetorno] = useState(null);
  const [enviando, setEnviando] = useState(false);
  const [enviandoFoto, setEnviandoFoto] = useState(false);
  const [removendoFoto, setRemovendoFoto] = useState(false);
  const seletorDeArquivo = useRef(null);
  const idArquivo = `foto-${useId().replace(/[^a-zA-Z0-9_-]/g, "")}`;

  const enviarFoto = async (evento) => {
    const arquivo = evento.target.files?.[0];
    evento.target.value = ""; // permite escolher o mesmo arquivo de novo
    if (!arquivo) return;
    if (!ehImagemAceita(arquivo)) {
      setErros((atuais) => ({ ...atuais, arquivo: "Escolha uma imagem PNG, JPG ou WebP." }));
      return;
    }
    if (arquivo.size > TAMANHO_MAXIMO_DA_FOTO) {
      setErros((atuais) => ({ ...atuais, arquivo: "A imagem deve ter até 2 MB." }));
      return;
    }
    setEnviandoFoto(true);
    setRetorno(null);
    setErros((atuais) => ({ ...atuais, arquivo: undefined, fotoUrl: undefined }));
    try {
      const perfil = await enviarFotoDePerfil(arquivo);
      atualizarUsuario(perfil);
      setDados((atuais) => ({ ...atuais, fotoUrl: perfil.fotoUrl ?? "" }));
      setRetorno({ tom: "sucesso", texto: "Foto enviada. Ela já é a sua foto de perfil." });
    } catch (falha) {
      setErros((atuais) => ({ ...atuais, arquivo: falha.campos?.arquivo ?? falha.message }));
    } finally {
      setEnviandoFoto(false);
    }
  };

  const alterar = (campo, valor) => {
    setDados((atuais) => ({ ...atuais, [campo]: valor }));
    setErros((atuais) => ({ ...atuais, [campo]: undefined }));
  };

  /* Remove na hora, sem esperar o "Salvar": usa o nome e o telefone já
     gravados (não os ainda em edição) e manda a foto vazia. Se a foto tinha
     sido enviada do computador, o back-end apaga o arquivo. */
  const removerFoto = async () => {
    setRemovendoFoto(true);
    setRetorno(null);
    setErros((atuais) => ({ ...atuais, arquivo: undefined, fotoUrl: undefined }));
    try {
      const perfil = await atualizarPerfil({
        nomeCompleto: usuario?.nomeCompleto ?? dados.nomeCompleto.trim(),
        telefone: usuario?.telefone || undefined,
        fotoUrl: undefined,
      });
      atualizarUsuario(perfil);
      setDados((atuais) => ({ ...atuais, fotoUrl: "" }));
      setRetorno({ tom: "sucesso", texto: "Foto removida." });
    } catch (falha) {
      setRetorno({ tom: "erro", texto: falha.message });
    } finally {
      setRemovendoFoto(false);
    }
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
        exibirFotoNoPainel: comOpcaoDoPainel ? dados.exibirFotoNoPainel : undefined,
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

        {comOpcaoDoPainel && (
          <label className={estilos.caixaDeMarcar}>
            <input
              type="checkbox"
              checked={dados.exibirFotoNoPainel}
              onChange={(e) => alterar("exibirFotoNoPainel", e.target.checked)}
            />
            <span>
              Mostrar minha foto na página principal
              <small className={estilos.itemSecundario}>Ela aparece na faixa de boas-vindas do painel. Clique em Salvar para aplicar.</small>
            </span>
          </label>
        )}

        <div className={estilos.fotoLinha}>
          <span className={estilos.fotoPrevia} aria-hidden="true">
            {dados.fotoUrl ? <img src={enderecoDaApi(dados.fotoUrl)} alt="" /> : null}
          </span>
          <div className={estilos.fotoAcoes}>
            <input
              ref={seletorDeArquivo}
              id={idArquivo}
              type="file"
              accept={ACEITA_FOTO}
              className="sr-only"
              onChange={enviarFoto}
              aria-describedby={`${idArquivo}-dica${erros.arquivo ? ` ${idArquivo}-erro` : ""}`}
              disabled={enviandoFoto}
            />
            <div className={estilos.fotoBotoes}>
              <button
                type="button"
                className={estilos.botaoSecundario}
                onClick={() => seletorDeArquivo.current?.click()}
                disabled={enviandoFoto || removendoFoto}
              >
                {enviandoFoto ? "Enviando…" : "Enviar foto do computador"}
              </button>
              {usuario?.fotoUrl && (
                <button
                  type="button"
                  className={estilos.botaoPerigo}
                  onClick={removerFoto}
                  disabled={enviandoFoto || removendoFoto}
                >
                  {removendoFoto ? "Removendo…" : "Remover foto"}
                </button>
              )}
            </div>
            <p id={`${idArquivo}-dica`} className={estilos.itemSecundario}>PNG, JPG ou WebP, até 2 MB.</p>
            {erros.arquivo && <p id={`${idArquivo}-erro`} className={estilos.erroCampo}>{erros.arquivo}</p>}
          </div>
        </div>
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
