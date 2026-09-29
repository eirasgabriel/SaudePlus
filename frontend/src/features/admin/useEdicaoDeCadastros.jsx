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

  const salvar = async (dados) => {
    if (modal.usuario) {
      const salvo = await api.alterarUsuario(modal.usuario.id, dados);
      aoConcluir(`Conta de ${salvo.nome} atualizada.`);
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
        titulo="Excluir usuário"
        mensagem={
          excluindo
            ? `${excluindo.nome} deixa de entrar no sistema. O histórico (consultas, exames, cobranças) é mantido.`
            : ""
        }
        rotuloConfirmar="Excluir"
        aoConfirmar={async () => {
          await api.excluirUsuario(excluindo.id);
          aoConcluir(`Conta de ${excluindo.nome} excluída (inativa).`);
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
      <ModalUnidade aberto={Boolean(modal)} unidade={modal?.unidade ?? null} aoFechar={() => setModal(null)} aoSalvar={salvar} />
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
    editar: (unidade) => setModal({ unidade }),
    excluir: setExcluindo,
    elementos,
  };
}
