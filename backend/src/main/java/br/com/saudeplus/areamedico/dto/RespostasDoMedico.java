package br.com.saudeplus.areamedico.dto;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.UUID;

import br.com.saudeplus.agenda.Modalidade;
import br.com.saudeplus.agendamentos.Agendamento;
import br.com.saudeplus.agendamentos.StatusAgendamento;
import br.com.saudeplus.agendamentos.TipoAtendimento;
import br.com.saudeplus.clinicas.StatusUnidade;
import br.com.saudeplus.clinicas.Unidade;
import br.com.saudeplus.exames.Exame;
import br.com.saudeplus.exames.StatusExame;
import br.com.saudeplus.profissionais.Especialidade;
import br.com.saudeplus.profissionais.Medico;

/** Respostas das telas do médico além do painel: consultas, exames, unidades e perfil. */
public final class RespostasDoMedico {

    private static final DateTimeFormatter HORA = DateTimeFormatter.ofPattern("HH:mm");

    private RespostasDoMedico() {
    }

    public record Rotulo(UUID id, String nome) {
    }

    /** Linha da tela "Consultas": como o item da agenda, com a data e onde foi. */
    public record ConsultaDoPeriodo(UUID id, LocalDate data, String horario, UUID pacienteId, String paciente,
            String tipo, TipoAtendimento tipoAtendimento, Modalidade modalidade, StatusAgendamento status,
            String unidade, String especialidade) {

        public static ConsultaDoPeriodo de(Agendamento a) {
            return new ConsultaDoPeriodo(a.getId(), a.getData(), a.getHorario().format(HORA), a.getPaciente().getId(),
                    a.getPaciente().getUsuario().getNomeCompleto(), a.descricao(), a.getTipo(), a.getModalidade(),
                    a.getStatus(), a.getUnidade().getNome(), a.getEspecialidade().getNome());
        }
    }

    /** `idade` em anos completos na data da consulta, ou nula sem data de nascimento. */
    public record PacienteDaConsulta(UUID id, String nome, Integer idade, String sexo) {
    }

    public record ExameDaConsulta(UUID id, String nome, StatusExame status, LocalDate prazo,
            boolean resultadoDisponivel) {

        public static ExameDaConsulta de(Exame e) {
            return new ExameDaConsulta(e.getId(), e.getTipo().getNome(), e.getStatus(), e.getPrazo(),
                    e.resultadoDisponivel());
        }
    }

    /**
     * Detalhe da consulta, com o registro do atendimento e os exames pedidos
     * nela. `alteravel` diz se ainda cabe mudar o status.
     */
    public record ConsultaDetalhe(UUID id, LocalDate data, String horario, int duracaoMin, PacienteDaConsulta paciente,
            TipoAtendimento tipoAtendimento, Modalidade modalidade, StatusAgendamento status, boolean alteravel,
            String motivo, String resumo, String desfecho, String motivoCancelamento, Rotulo unidade,
            Rotulo especialidade, List<ExameDaConsulta> exames) {

        public static ConsultaDetalhe de(Agendamento a, List<Exame> exames) {
            var paciente = a.getPaciente();
            Unidade unidade = a.getUnidade();
            Especialidade especialidade = a.getEspecialidade();
            return new ConsultaDetalhe(a.getId(), a.getData(), a.getHorario().format(HORA), a.getDuracaoMin(),
                    new PacienteDaConsulta(paciente.getId(), paciente.getUsuario().getNomeCompleto(),
                            paciente.idadeEm(a.getData()), paciente.getSexo()),
                    a.getTipo(), a.getModalidade(), a.getStatus(), a.alteravel(), a.getMotivo(), a.getResumo(),
                    a.getDesfecho(), a.getMotivoCancelamento(), new Rotulo(unidade.getId(), unidade.getNome()),
                    new Rotulo(especialidade.getId(), especialidade.getNome()),
                    exames.stream().map(ExameDaConsulta::de).toList());
        }
    }

    /** Detalhe de um exame pedido pelo médico. `coletaEm` só existe depois de agendada a coleta. */
    public record ExameDetalhe(UUID id, String nome, String categoria, String preparo, UUID pacienteId,
            String paciente, StatusExame status, LocalDate prazo, Instant solicitadoEm, Instant coletaEm,
            Rotulo unidade, UUID agendamentoOrigemId, boolean resultadoDisponivel, Instant resultadoLiberadoEm) {

        public static ExameDetalhe de(Exame e) {
            Unidade unidade = e.getUnidade();
            return new ExameDetalhe(e.getId(), e.getTipo().getNome(), e.getTipo().getCategoria(), e.getTipo().getPreparo(),
                    e.getPaciente().getId(), e.getPaciente().getUsuario().getNomeCompleto(), e.getStatus(), e.getPrazo(),
                    e.getCriadoEm(), e.getDataHora(), unidade == null ? null : new Rotulo(unidade.getId(), unidade.getNome()),
                    e.getAgendamentoOrigemId(), e.resultadoDisponivel(), e.getResultadoLiberadoEm());
        }
    }

    /** Unidade vinculada ao médico, inclusive fora de funcionamento (o `status` diz). */
    public record UnidadeDoMedico(UUID id, String nome, String endereco, String bairro, String cidade, String uf,
            String telefone, String horarioFuncionamento, String mapUrl, StatusUnidade status) {

        public static UnidadeDoMedico de(Unidade u) {
            return new UnidadeDoMedico(u.getId(), u.getNome(), u.getEndereco(), u.getBairro(), u.getCidade(), u.getUf(),
                    u.getTelefone(), u.getHorarioFuncionamento(), u.getMapUrl(), u.getStatus());
        }
    }

    /**
     * "Meu perfil": o que aparece no perfil público. Nome, telefone e foto se
     * mudam em `/api/auth/perfil`; bio e valor, aqui; CRM, especialidades e
     * unidades, só pela administração.
     */
    public record PerfilProfissional(UUID id, String nome, String email, String telefone, String fotoUrl, String crm,
            String crmUf, String bio, BigDecimal valorConsulta, BigDecimal notaMedia, int totalAvaliacoes,
            List<Rotulo> especialidades, List<Rotulo> unidades) {

        public static PerfilProfissional de(Medico m) {
            var usuario = m.getUsuario();
            return new PerfilProfissional(m.getId(), usuario.getNomeCompleto(), usuario.getEmail(), usuario.getTelefone(),
                    usuario.getFotoUrl(), m.getCrm(), m.getCrmUf(), m.getBio(), m.getValorConsulta(), m.getNotaMedia(),
                    m.getTotalAvaliacoes(),
                    m.especialidadesOrdenadas().stream().map(e -> new Rotulo(e.getId(), e.getNome())).toList(),
                    m.unidadesVinculadas().stream().map(u -> new Rotulo(u.getId(), u.getNome())).toList());
        }
    }
}
