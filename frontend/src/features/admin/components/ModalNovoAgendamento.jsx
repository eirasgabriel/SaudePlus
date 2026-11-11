import { useEffect, useId, useState } from "react";

import ModalAgendamento from "../../../components/ModalAgendamento";
import estilos from "../../../components/ModalAgendamento.module.css";
import { criarAgendamento, listarPacientesParaAgendar } from "../admin.api.js";

/**
 * "Novo agendamento" da clínica: o mesmo formulário do paciente, com a
 * escolha do paciente no topo. `aoAgendar(paciente, escolha)` roda depois que
 * a API aceitou (para recarregar a lista e mostrar o aviso).
 */
export default function ModalNovoAgendamento({ aberto, aoFechar, aoAgendar }) {
  const idPaciente = `na-${useId().replace(/[^a-zA-Z0-9_-]/g, "")}-paciente`;
  const [pacientes, definirPacientes] = useState({ estado: "carregando", lista: [] });
  const [pacienteId, definirPacienteId] = useState("");

  useEffect(() => {
    if (!aberto) return undefined;
    const controle = new AbortController();
    listarPacientesParaAgendar({ sinal: controle.signal })
      .then((lista) => {
        if (!controle.signal.aborted) definirPacientes({ estado: "pronto", lista });
      })
      .catch(() => {
        if (!controle.signal.aborted) definirPacientes({ estado: "erro", lista: [] });
      });
    return () => controle.abort();
  }, [aberto]);

  const fechar = () => {
    definirPacienteId("");
    aoFechar();
  };

  const paciente = pacientes.lista.find((p) => p.usuarioId === pacienteId) ?? null;

  const campoPaciente = (
    <div className={estilos.campo}>
      <label className={estilos.rotulo} htmlFor={idPaciente}>Paciente</label>
      <select
        id={idPaciente}
        className={estilos.select}
        value={pacienteId}
        onChange={(evento) => definirPacienteId(evento.target.value)}
        disabled={pacientes.estado !== "pronto"}
      >
        <option value="">
          {pacientes.estado === "carregando"
            ? "Carregando pacientes…"
            : pacientes.estado === "erro"
              ? "Não foi possível carregar os pacientes"
              : "Selecione o paciente"}
        </option>
        {pacientes.lista.map((p) => (
          <option key={p.usuarioId} value={p.usuarioId}>
            {p.nome}
            {p.cpf ? ` · CPF ${p.cpf}` : ` · ${p.email}`}
          </option>
        ))}
      </select>
    </div>
  );

  const confirmar = async (escolha) => {
    await criarAgendamento({
      pacienteUsuarioId: pacienteId,
      medicoId: escolha.profissionalId,
      especialidadeId: escolha.especialidadeId,
      data: escolha.data,
      horario: escolha.horario,
      modalidade: escolha.modalidade,
    });
    definirPacienteId("");
    aoAgendar?.(paciente, escolha);
  };

  return (
    <ModalAgendamento
      aberto={aberto}
      aoFechar={fechar}
      aoConfirmar={confirmar}
      titulo="Novo agendamento"
      descricao="Escolha o paciente, a especialidade, o profissional e um horário livre."
      campoExtra={campoPaciente}
      validarExtra={() => (pacienteId ? null : "Escolha o paciente.")}
    />
  );
}
