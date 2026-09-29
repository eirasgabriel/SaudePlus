import { useState } from "react";

import { CampoDaTela, CartaoDaTela, ConteudoCarregado, Mensagem } from "../../../components/Telas.jsx";
import estilos from "../../../styles/telas.module.css";
import { hojeIso } from "../../../utils/formatos.js";
import { useAuth } from "../../auth/auth.context.js";
import { FormularioDeSenha } from "../../auth/components/FormulariosDaConta.jsx";
import { atualizarMeuPerfil, buscarMeuPerfil, listarConvenios } from "../paciente.api.js";
import { useDadosDaApi } from "../useDadosDaApi.js";
import TelaDoPaciente from "./TelaDoPaciente.jsx";

const carregar = async ({ sinal }) => {
  const [perfil, convenios] = await Promise.all([buscarMeuPerfil({ sinal }), listarConvenios({ sinal })]);
  return { perfil, convenios };
};

const SEXOS = [
  { valor: "", rotulo: "Não informar agora" },
  { valor: "feminino", rotulo: "Feminino" },
  { valor: "masculino", rotulo: "Masculino" },
  { valor: "outro", rotulo: "Outro" },
  { valor: "nao_informado", rotulo: "Prefiro não informar" },
];

/** "Minhas informações": dados pessoais, convênio e senha. */
export default function MinhasInformacoes() {
  const dados = useDadosDaApi(carregar);

  return (
    <TelaDoPaciente titulo="Minhas informações" subtitulo="Mantenha seus dados em dia para agilizar o atendimento.">
      <ConteudoCarregado estado={dados} carregando="Carregando seus dados…">
        {dados.dados && <FormularioDoPerfil key={dados.dados.perfil.id} {...dados.dados} aoSalvar={dados.recarregar} />}
      </ConteudoCarregado>
      <FormularioDeSenha />
    </TelaDoPaciente>
  );
}

function FormularioDoPerfil({ perfil, convenios, aoSalvar }) {
  const { usuario, atualizarUsuario } = useAuth();
  const [form, setForm] = useState(() => ({
    nomeCompleto: perfil.nome ?? "",
    telefone: perfil.telefone ?? "",
    dataNascimento: perfil.dataNascimento ?? "",
    sexo: perfil.sexo ?? "",
    cpf: perfil.cpf ?? "",
    convenioId: perfil.convenio?.id ?? "",
    numeroCarteirinha: perfil.numeroCarteirinha ?? "",
  }));
  const [erros, setErros] = useState({});
  const [retorno, setRetorno] = useState(null);
  const [enviando, setEnviando] = useState(false);
  // O CPF é informado uma vez; depois, só a clínica corrige.
  const cpfTravado = Boolean(perfil.cpf);

  const alterar = (campo, valor) => {
    setForm((atual) => ({ ...atual, [campo]: valor }));
    setErros((atuais) => ({ ...atuais, [campo]: undefined }));
  };

  const salvar = async (evento) => {
    evento.preventDefault();
    setEnviando(true);
    setRetorno(null);
    try {
      const salvo = await atualizarMeuPerfil({
        nomeCompleto: form.nomeCompleto.trim(),
        telefone: form.telefone.trim() || undefined,
        dataNascimento: form.dataNascimento || undefined,
        sexo: form.sexo || undefined,
        cpf: cpfTravado ? undefined : form.cpf.trim() || undefined,
        convenioId: form.convenioId || undefined,
        numeroCarteirinha: form.convenioId ? form.numeroCarteirinha.trim() || undefined : undefined,
      });
      // O nome também aparece no cabeçalho do painel.
      if (usuario) atualizarUsuario({ ...usuario, nomeCompleto: salvo.nome, telefone: salvo.telefone });
      setErros({});
      setRetorno({ tom: "sucesso", texto: "Dados salvos." });
      aoSalvar();
    } catch (falha) {
      setErros(falha.campos ?? {});
      setRetorno({ tom: "erro", texto: falha.message });
    } finally {
      setEnviando(false);
    }
  };

  const texto = (nome, rotulo, props = {}) => (
    <CampoDaTela rotulo={rotulo} erro={erros[nome]}>
      {(controle) => <input value={form[nome]} onChange={(e) => alterar(nome, e.target.value)} {...props} {...controle} />}
    </CampoDaTela>
  );

  return (
    <CartaoDaTela titulo="Dados pessoais">
      <form className={estilos.formulario} onSubmit={salvar} noValidate>
        <div className={estilos.grade2}>
          {texto("nomeCompleto", "Nome completo", { maxLength: 120, autoComplete: "name" })}
          {texto("telefone", "Telefone", { inputMode: "tel", maxLength: 20, autoComplete: "tel" })}
          {texto("dataNascimento", "Data de nascimento", { type: "date", max: hojeIso(-1) })}
          <CampoDaTela rotulo="Sexo" erro={erros.sexo} tipo="select">
            {(controle) => (
              <select value={form.sexo} onChange={(e) => alterar("sexo", e.target.value)} {...controle}>
                {SEXOS.map((s) => <option key={s.valor} value={s.valor}>{s.rotulo}</option>)}
              </select>
            )}
          </CampoDaTela>
          {texto("cpf", "CPF", { inputMode: "numeric", maxLength: 14, disabled: cpfTravado })}
          <CampoDaTela rotulo="Convênio" erro={erros.convenioId} tipo="select">
            {(controle) => (
              <select value={form.convenioId} onChange={(e) => alterar("convenioId", e.target.value)} {...controle}>
                <option value="">Particular (sem convênio)</option>
                {convenios.map((c) => <option key={c.id} value={c.id}>{c.nome}</option>)}
              </select>
            )}
          </CampoDaTela>
          {form.convenioId && texto("numeroCarteirinha", "Número da carteirinha", { maxLength: 40 })}
        </div>
        <p className={estilos.itemSecundario}>
          E-mail de acesso: {perfil.email}.{cpfTravado ? " Para corrigir o CPF, procure a clínica." : ""}
        </p>
        {retorno && <Mensagem tom={retorno.tom}>{retorno.texto}</Mensagem>}
        <div className={estilos.botoes}>
          <button type="submit" className={estilos.botao} disabled={enviando}>{enviando ? "Salvando…" : "Salvar"}</button>
        </div>
      </form>
    </CartaoDaTela>
  );
}
