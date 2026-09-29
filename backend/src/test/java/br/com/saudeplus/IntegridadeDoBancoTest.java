package br.com.saudeplus;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatNoException;
import static org.assertj.core.api.Assertions.catchThrowable;
import static org.springframework.security.test.web.servlet.setup.SecurityMockMvcConfigurers.springSecurity;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.math.BigDecimal;
import java.sql.Timestamp;
import java.time.Clock;
import java.time.Duration;
import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.ApplicationContext;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpHeaders;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.context.WebApplicationContext;

import br.com.saudeplus.agendamentos.Agendamento;
import br.com.saudeplus.agendamentos.AgendamentoRepository;
import br.com.saudeplus.agendamentos.StatusAgendamento;
import br.com.saudeplus.comum.RestricoesDoBanco;
import br.com.saudeplus.financeiro.StatusTransacao;
import br.com.saudeplus.financeiro.Transacao;
import br.com.saudeplus.financeiro.TransacaoRepository;
import br.com.saudeplus.pacientes.Paciente;
import br.com.saudeplus.profissionais.Medico;
import br.com.saudeplus.retencao.RetencaoDeDados;
import br.com.saudeplus.usuarios.Papel;
import br.com.saudeplus.usuarios.Usuario;

/** O que a migração V6 faz o banco garantir sozinho, e a rotina de retenção. */
@TesteDeIntegracao
class IntegridadeDoBancoTest {

    private static final String SOBREPOSICAO_DO_MEDICO = "ex_agendamentos_medico_sem_sobreposicao";
    private static final String SOBREPOSICAO_DO_PACIENTE = "ex_agendamentos_paciente_sem_sobreposicao";

    @Autowired
    private ApplicationContext contexto;

    @Autowired
    private AgendamentoRepository agendamentos;

    @Autowired
    private TransacaoRepository transacoes;

    @Autowired
    private JdbcTemplate jdbc;

    @Autowired
    private Clock relogio;

    private Cenarios cenarios;
    private LocalDate dia;

    @BeforeEach
    void preparar() {
        cenarios = new Cenarios(contexto);
        // Longe o bastante para não cruzar com a agenda de outros testes.
        dia = LocalDate.now(relogio).plusDays(40);
    }

    private Paciente novoPaciente() {
        return cenarios.paciente("Paciente " + UUID.randomUUID().toString().substring(0, 8), null);
    }

    private Throwable reservar(Medico medico, Paciente paciente, String horario) {
        return catchThrowable(() -> cenarios.agendamento(medico, paciente, dia, horario, StatusAgendamento.PENDENTE));
    }

    @Nested
    @DisplayName("Consultas sobrepostas")
    class Sobreposicao {

        @Test
        @DisplayName("o médico não recebe duas consultas que se cruzam, mesmo com inícios diferentes")
        void medico() {
            Medico medico = cenarios.medico();
            cenarios.agendamento(medico, novoPaciente(), dia, "08:00", StatusAgendamento.PENDENTE);

            Throwable erro = reservar(medico, novoPaciente(), "08:20");

            assertThat(erro).isInstanceOf(DataIntegrityViolationException.class);
            assertThat(RestricoesDoBanco.violou(erro, SOBREPOSICAO_DO_MEDICO)).isTrue();
            assertThat(RestricoesDoBanco.violou(erro, SOBREPOSICAO_DO_PACIENTE)).isFalse();
        }

        @Test
        @DisplayName("o paciente não fica em duas consultas ao mesmo tempo, com médicos diferentes")
        void paciente() {
            Paciente paciente = novoPaciente();
            cenarios.agendamento(cenarios.medico(), paciente, dia, "10:00", StatusAgendamento.CONFIRMADA);

            Throwable erro = reservar(cenarios.medico(), paciente, "10:15");

            assertThat(erro).isInstanceOf(DataIntegrityViolationException.class);
            assertThat(RestricoesDoBanco.violou(erro, SOBREPOSICAO_DO_PACIENTE)).isTrue();
        }

        @Test
        @DisplayName("consulta que termina às 08:30 não bloqueia a das 08:30")
        void encostadas() {
            Medico medico = cenarios.medico();
            Paciente paciente = novoPaciente();
            cenarios.agendamento(medico, paciente, dia, "08:00", StatusAgendamento.PENDENTE);

            assertThatNoException().isThrownBy(
                    () -> cenarios.agendamento(medico, paciente, dia, "08:30", StatusAgendamento.PENDENTE));
        }

        @Test
        @DisplayName("consulta cancelada libera o intervalo")
        void cancelada() {
            Medico medico = cenarios.medico();
            cenarios.agendamento(medico, novoPaciente(), dia, "14:00", StatusAgendamento.CANCELADA);

            assertThatNoException().isThrownBy(
                    () -> cenarios.agendamento(medico, novoPaciente(), dia, "14:10", StatusAgendamento.PENDENTE));
        }
    }

    @Nested
    @DisplayName("Cobrança da consulta")
    class Cobranca {

        private Agendamento consulta() {
            return cenarios.agendamento(cenarios.medico(), novoPaciente(), dia, "16:00", StatusAgendamento.CONFIRMADA);
        }

        private Transacao automatica(Agendamento consulta) {
            return Transacao.daConsulta(consulta.getPaciente(), consulta.getId(), "Consulta", new BigDecimal("150.00"),
                    null, Instant.now());
        }

        @Test
        @DisplayName("só uma cobrança automática ativa por consulta")
        void unica() {
            Agendamento consulta = consulta();
            transacoes.save(automatica(consulta));

            Throwable erro = catchThrowable(() -> transacoes.save(automatica(consulta)));

            assertThat(erro).isInstanceOf(DataIntegrityViolationException.class);
            assertThat(RestricoesDoBanco.violou(erro, "uk_transacoes_cobranca_da_consulta")).isTrue();
        }

        @Test
        @DisplayName("lançamento manual ligado à mesma consulta continua permitido")
        void manualLivre() {
            Agendamento consulta = consulta();
            transacoes.save(automatica(consulta));

            assertThatNoException().isThrownBy(() -> transacoes.save(new Transacao(consulta.getPaciente(),
                    consulta.getId(), "Taxa de material", BigDecimal.TEN, null, Instant.now())));
        }

        @Test
        @DisplayName("depois do estorno, a consulta pode ser cobrada de novo")
        void aposEstorno() {
            Agendamento consulta = consulta();
            Transacao primeira = automatica(consulta);
            primeira.estornar(Instant.now());
            transacoes.save(primeira);

            Transacao segunda = transacoes.save(automatica(consulta));

            assertThat(segunda.getStatus()).isEqualTo(StatusTransacao.PENDENTE);
        }
    }

    @Nested
    @DisplayName("LGPD")
    class Lgpd {

        @Autowired
        private WebApplicationContext web;

        @Autowired
        private RetencaoDeDados retencao;

        private int registros(String acao, UUID entidadeId) {
            return jdbc.queryForObject("SELECT count(*) FROM registros_atividade WHERE acao = ? AND entidade_id = ?",
                    Integer.class, acao, entidadeId);
        }

        @Test
        @DisplayName("o médico abrir a ficha de um paciente fica registrado na auditoria")
        void leituraDaFichaAuditada() throws Exception {
            Medico medico = cenarios.medico();
            Paciente paciente = novoPaciente();
            cenarios.agendamento(medico, paciente, dia, "11:00", StatusAgendamento.CONFIRMADA);
            MockMvc mvc = MockMvcBuilders.webAppContextSetup(web).apply(springSecurity()).build();

            mvc.perform(get("/api/medico/pacientes/{id}", paciente.getId())
                    .header(HttpHeaders.AUTHORIZATION, cenarios.bearer(medico))).andExpect(status().isOk());

            assertThat(registros("paciente.ficha.ver", paciente.getId())).isEqualTo(1);
        }

        @Test
        @DisplayName("a retenção apaga só o que passou do prazo, e nunca o que não é operacional")
        void retencao() {
            Usuario dono = cenarios.usuario("Retenção " + UUID.randomUUID().toString().substring(0, 8), Papel.PACIENTE);
            Timestamp antigo = Timestamp.from(Instant.now().minus(Duration.ofDays(6 * 365)));
            Timestamp recente = Timestamp.from(Instant.now().minus(Duration.ofDays(1)));

            UUID lidaAntiga = notificacao(dono, true, antigo);
            UUID naoLidaAntiga = notificacao(dono, false, antigo);
            UUID lidaRecente = notificacao(dono, true, recente);
            UUID tokenVencido = token(dono, antigo);
            UUID tokenValido = token(dono, Timestamp.from(Instant.now().plus(Duration.ofMinutes(30))));
            UUID auditoriaAntiga = auditoria(antigo);
            UUID auditoriaRecente = auditoria(recente);

            RetencaoDeDados.Resultado resultado = retencao.executar();

            assertThat(existe("notificacoes", lidaAntiga)).isFalse();
            assertThat(existe("notificacoes", naoLidaAntiga)).as("aviso não lido fica").isTrue();
            assertThat(existe("notificacoes", lidaRecente)).isTrue();
            assertThat(existe("tokens_redefinicao_senha", tokenVencido)).isFalse();
            assertThat(existe("tokens_redefinicao_senha", tokenValido)).isTrue();
            assertThat(existe("registros_atividade", auditoriaAntiga)).isFalse();
            assertThat(existe("registros_atividade", auditoriaRecente)).isTrue();
            assertThat(resultado.notificacoes()).isPositive();
        }

        private UUID notificacao(Usuario dono, boolean lida, Timestamp quando) {
            return jdbc.queryForObject("""
                    INSERT INTO notificacoes (usuario_id, tipo, titulo, lida, criada_em)
                    VALUES (?, 'sistema', 'Teste de retenção', ?, ?) RETURNING id""", UUID.class, dono.getId(), lida, quando);
        }

        private UUID token(Usuario dono, Timestamp expiraEm) {
            return jdbc.queryForObject("""
                    INSERT INTO tokens_redefinicao_senha (usuario_id, hash_sha256, expira_em)
                    VALUES (?, ?, ?) RETURNING id""", UUID.class, dono.getId(),
                    UUID.randomUUID().toString().replace("-", "") + UUID.randomUUID().toString().replace("-", ""),
                    expiraEm);
        }

        private UUID auditoria(Timestamp quando) {
            return jdbc.queryForObject("""
                    INSERT INTO registros_atividade (acao, criado_em) VALUES ('teste.retencao', ?) RETURNING id""",
                    UUID.class, quando);
        }

        private boolean existe(String tabela, UUID id) {
            return jdbc.queryForObject("SELECT count(*) FROM " + tabela + " WHERE id = ?", Integer.class, id) == 1;
        }
    }
}
