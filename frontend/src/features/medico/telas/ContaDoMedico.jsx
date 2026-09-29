import { useState } from "react";

import {
  CampoDaTela,
  CartaoDaTela,
  ConteudoCarregado,
  Dados,
  Mensagem,
} from "../../../components/Telas.jsx";
import estilos from "../../../styles/telas.module.css";
import { moeda } from "../../../utils/formatos.js";
import { FormularioDaConta, FormularioDeSenha } from "../../auth/components/FormulariosDaConta.jsx";
import { useDadosDaApi } from "../../paciente/useDadosDaApi.js";
import { atualizarPerfilProfissional, buscarPerfilProfissional } from "../medico.api.js";
import TelaDoMedico from "./TelaDoMedico.jsx";

const carregar = ({ sinal }) => buscarPerfilProfissional({ sinal });

/** "Minha conta": dados da conta, perfil profissional (apresentação e valor) e senha. */
export default function ContaDoMedico() {
  const perfil = useDadosDaApi(carregar);

  return (
    <TelaDoMedico titulo="Minha conta" subtitulo="O que aparece no seu perfil público e os seus dados de acesso.">
      <FormularioDaConta />
      <ConteudoCarregado estado={perfil} carregando="Carregando o perfil profissional…">
        {perfil.dados && <PerfilProfissional key={perfil.dados.id} perfil={perfil.dados} aoSalvar={perfil.recarregar} />}
      </ConteudoCarregado>
      <FormularioDeSenha />
    </TelaDoMedico>
  );
}

function PerfilProfissional({ perfil, aoSalvar }) {
  const [bio, setBio] = useState(perfil.bio ?? "");
  const [valor, setValor] = useState(perfil.valorConsulta ?? "");
  const [erros, setErros] = useState({});
  const [retorno, setRetorno] = useState(null);
  const [enviando, setEnviando] = useState(false);

  const salvar = async (evento) => {
    evento.preventDefault();
    setEnviando(true);
    setRetorno(null);
    try {
      await atualizarPerfilProfissional({ bio: bio.trim() || undefined, valorConsulta: valor === "" ? undefined : Number(valor) });
      setErros({});
      setRetorno({ tom: "sucesso", texto: "Perfil profissional salvo. O perfil público já mostra a mudança." });
      aoSalvar();
    } catch (falha) {
      setErros(falha.campos ?? {});
      setRetorno({ tom: "erro", texto: falha.message });
    } finally {
      setEnviando(false);
    }
  };

  const nota = perfil.totalAvaliacoes ? `${Number(perfil.notaMedia).toFixed(1)} (${perfil.totalAvaliacoes} avaliações)` : "Sem avaliações";

  return (
    <CartaoDaTela titulo="Perfil profissional">
      <Dados
        itens={[
          ["CRM", `${perfil.crm}-${perfil.crmUf}`],
          ["Especialidades", perfil.especialidades.map((e) => e.nome).join(", ")],
          ["Unidades", perfil.unidades.map((u) => u.nome).join(", ")],
          ["Avaliação", nota],
          ["Valor atual", perfil.valorConsulta != null ? moeda(perfil.valorConsulta) : null],
        ]}
      />
      <p className={estilos.itemSecundario}>CRM, especialidades e unidades são alterados pela administração.</p>
      <form className={estilos.formulario} onSubmit={salvar} noValidate>
        <CampoDaTela rotulo="Apresentação" erro={erros.bio} tipo="area">
          {(props) => <textarea maxLength={2000} rows={5} value={bio} onChange={(e) => setBio(e.target.value)} {...props} />}
        </CampoDaTela>
        <CampoDaTela rotulo="Valor da consulta (R$)" erro={erros.valorConsulta}>
          {(props) => <input type="number" min={0} step="0.01" value={valor} onChange={(e) => setValor(e.target.value)} {...props} />}
        </CampoDaTela>
        {retorno && <Mensagem tom={retorno.tom}>{retorno.texto}</Mensagem>}
        <div className={estilos.botoes}>
          <button type="submit" className={estilos.botao} disabled={enviando}>{enviando ? "Salvando…" : "Salvar perfil"}</button>
        </div>
      </form>
    </CartaoDaTela>
  );
}
