import { useState } from "react";

import DialogoConfirmacao from "../../components/DialogoConfirmacao.jsx";
import * as api from "./admin.api.js";
import ModalNovoUsuario from "./components/ModalNovoUsuario.jsx";
import ModalUnidade from "./components/ModalUnidade.jsx";

/* Criar, editar e excluir contas e unidades. Ficam em hooks porque a mesma
   ação aparece em dois lugares (a página do módulo e a aba de
   Configurações). Cada hook devolve as funções que abrem os modais e os
   `elementos` para a tela renderizar. `aoConcluir(texto)` recebe a mensagem
   de sucesso; a tela recarrega e mostra o aviso. */

/** Contas: `usuario` nas funções é a resposta da API (`UsuarioAdminResposta`). */
export function useEdicaoDeUsuarios({ especialidades = [], unidades = [], podeCriarAdmin, aoConcluir }) {
  const [modal, setModal] = useState(null); // { usuario } — `usuario` nulo = nova conta
  const [excluindo, setExcluindo] = useState(null);
  const excluindoDeVez = excluindo?.status === "inativo";

  const salvar = async (dados) => {
    if (modal.usuario) {
      const salvo = await api.alterarUsuario(modal.usuario.id, dados);
      aoConcluir(`Conta de ${salvo.nome} atualizada.${dados.novaSenha ? " Senha redefinida com sucesso." : ""}`);
    } else {
      const criado = await api.criarUsuario(dados);
      aoConcluir(`Conta de ${criado.nome} criada. O convite para definir a senha foi enviado para ${criado.email}.`);
    }
  };

  const elementos = (
    <>
      <ModalNovoUsuario
        aberto={Boolean(modal)}
        usuario={modal?.usuario ?? null}
        aoFechar={() => setModal(null)}
        aoCriar={salvar}
        especialidades={especialidades}
        unidades={unidades}
        podeCriarAdmin={podeCriarAdmin}
      />
      <DialogoConfirmacao
        aberto={Boolean(excluindo)}
        aoFechar={() => setExcluindo(null)}
        titulo={excluindoDeVez ? "Excluir usuário permanentemente" : "Inativar usuário"}
        mensagem={
          !excluindo
            ? ""
            : excluindoDeVez
            ? `A conta de ${excluindo.nome} sai do sistema de vez e não poderá ser reativada. Cadastro e histórico (consultas, exames, cobranças) ficam guardados, como exige a LGPD.`
            : `${excluindo.nome} fica inativo e deixa de entrar no sistema. Para excluir de vez, use a exclusão de novo com a conta inativa.`
        }
        rotuloConfirmar={excluindoDeVez ? "Excluir permanentemente" : "Inativar"}
        aoConfirmar={async () => {
          await api.excluirUsuario(excluindo.id);
          aoConcluir(
            excluindoDeVez
              ? `Conta de ${excluindo.nome} excluída permanentemente.`
              : `Conta de ${excluindo.nome} inativada. Use a exclusão de novo para excluir de vez.`,
          );
        }}
      />
    </>
  );

  return {
    novo: () => setModal({ usuario: null }),
    editar: (usuario) => setModal({ usuario }),
    excluir: setExcluindo,
    elementos,
  };
}

/** Unidades: `unidade` nas funções é a resposta da API (`UnidadeAdmin`). */
export function useEdicaoDeUnidades({ aoConcluir }) {
  const [modal, setModal] = useState(null); // { unidade } — `unidade` nula = nova
  const [excluindo, setExcluindo] = useState(null);

  const salvar = async (dados) => {
    if (modal.unidade) {
      const salva = await api.alterarUnidade(modal.unidade.id, dados);
      aoConcluir(`${salva.nome} atualizada.`);
    } else {
      const criada = await api.criarUnidade(dados);
      aoConcluir(`${criada.nome} cadastrada.`);
    }
  };

  const elementos = (
    <>
      <ModalUnidade
        aberto={Boolean(modal)}
        unidade={modal?.unidade ?? null}
        focar={modal?.focar}
        aoFechar={() => setModal(null)}
        aoSalvar={salvar}
      />
      <DialogoConfirmacao
        aberto={Boolean(excluindo)}
        aoFechar={() => setExcluindo(null)}
        titulo="Excluir clínica"
        mensagem={
          excluindo
            ? `${excluindo.nome} fica inativa: sai da busca e deixa de oferecer horários. Consultas já marcadas continuam.`
            : ""
        }
        rotuloConfirmar="Excluir"
        aoConfirmar={async () => {
          await api.excluirUnidade(excluindo.id);
          aoConcluir(`${excluindo.nome} excluída (inativa).`);
        }}
      />
    </>
  );

  return {
    nova: () => setModal({ unidade: null }),
    /** `opcoes.focar`: campo que abre com o foco (ex.: "emailLogin", pelo e-mail da tabela). */
    editar: (unidade, opcoes = {}) => setModal({ unidade, focar: opcoes.focar }),
    excluir: setExcluindo,
    elementos,
  };
}
