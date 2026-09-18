package br.com.saudeplus.dados;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

import br.com.saudeplus.agendamentos.Consulta;
import br.com.saudeplus.agendamentos.StatusConsulta;
import br.com.saudeplus.clinicas.Unidade;
import br.com.saudeplus.exames.Exame;
import br.com.saudeplus.notificacoes.Notificacao;
import br.com.saudeplus.notificacoes.TipoNotificacao;
import br.com.saudeplus.pacientes.Paciente;
import br.com.saudeplus.profissionais.Medico;

/**
 * Carga de demonstração usada pelos repositórios em memória.
 *
 * Os dados são os mesmos de `frontend/src/features/medico/data/medico.js`,
 * de propósito: assim o painel mostra exatamente a mesma tela consumindo a
 * API ou os mocks, e a diferença entre os dois caminhos fica visível.
 *
 * Quando o banco entrar, esta classe é substituída por uma migration de
 * seed e os repositórios em memória saem junto.
 */
public final class DadosDemonstracao {

    public static final String MEDICO_ID = "med-1";
    public static final String UNIDADE_ID = "uni-1";
    public static final LocalDate DATA_REFERENCIA = LocalDate.of(2026, 9, 15);
    public static final String FRASE_DO_DIA = "Cuidar de pessoas é o que nos move todos os dias.";

    private DadosDemonstracao() {
    }

    public static List<Medico> medicos() {
        return List.of(new Medico(
                MEDICO_ID,
                "Dr. Carlos Mendes",
                "Médico",
                "Clínico Geral",
                "CRM 123.456-RJ",
                null,
                UNIDADE_ID));
    }

    public static List<Unidade> unidades() {
        return List.of(new Unidade(
                UNIDADE_ID,
                "Clínica da Família – Centro",
                "Saquarema",
                "Rua das Flores, 123 – Saquarema, RJ",
                "(22) 2655-1234",
                "Segunda a Sexta - 07h às 17h",
                "#"));
    }

    public static List<Paciente> pacientes() {
        return List.of(
                new Paciente("ana-paula-ferreira", "Ana Paula Ferreira", 32, "Consulta de rotina", MEDICO_ID),
                new Paciente("joao-gabriel-santos", "João Gabriel Santos", 5, "Pediatria", MEDICO_ID),
                new Paciente("mariana-costa", "Mariana Costa", 28, "Retorno - Exames", MEDICO_ID),
                new Paciente("carlos-eduardo-lima", "Carlos Eduardo Lima", 45, "Clínica geral", MEDICO_ID),
                new Paciente("fernanda-alves", "Fernanda Alves", 60, "Consulta de rotina", MEDICO_ID),
                new Paciente("roberto-silva", "Roberto Silva", 51, "Consulta retorno", MEDICO_ID),
                new Paciente("juliana-rocha", "Juliana Rocha", 37, "Consulta de rotina", MEDICO_ID),
                new Paciente("lucas-martins", "Lucas Martins", 24, "Clínica geral", MEDICO_ID));
    }

    public static List<Consulta> consultas() {
        return List.of(
                consulta("ag-1", "ana-paula-ferreira", "08:00", "Consulta de rotina", StatusConsulta.REALIZADA),
                consulta("ag-2", "joao-gabriel-santos", "08:40", "Consulta pediátrica", StatusConsulta.REALIZADA),
                consulta("ag-3", "mariana-costa", "09:20", "Retorno - Exames", StatusConsulta.REALIZADA),
                consulta("ag-4", "carlos-eduardo-lima", "10:00", "Consulta clínica geral", StatusConsulta.EM_ANDAMENTO),
                consulta("ag-5", "fernanda-alves", "10:40", "Consulta de rotina", StatusConsulta.AGUARDANDO),
                consulta("ag-6", "roberto-silva", "11:20", "Consulta retorno", StatusConsulta.AGUARDANDO),
                consulta("ag-7", "juliana-rocha", "14:00", "Consulta de rotina", StatusConsulta.CONFIRMADA),
                consulta("ag-8", "lucas-martins", "14:40", "Consulta clínica geral", StatusConsulta.CONFIRMADA));
    }

    public static List<Exame> exames() {
        return List.of(
                new Exame("ex-1", "Hemograma completo", "joao-gabriel-santos", MEDICO_ID, "Hoje"),
                new Exame("ex-2", "Ultrassom abdominal", "mariana-costa", MEDICO_ID, "Amanhã"),
                new Exame("ex-3", "Raio-X tórax", "carlos-eduardo-lima", MEDICO_ID, "12/10"));
    }

    public static List<Notificacao> notificacoes() {
        return List.of(
                new Notificacao("nt-1", MEDICO_ID, TipoNotificacao.RESULTADO,
                        "Resultado de exame disponível", "Mariana Costa – Ultrassom abdominal", "Hoje, 09:15", false),
                new Notificacao("nt-2", MEDICO_ID, TipoNotificacao.AGENDAMENTO,
                        "Novo agendamento", "Lucas Martins – 14:40", "Hoje, 08:50", false),
                new Notificacao("nt-3", MEDICO_ID, TipoNotificacao.RETORNO,
                        "Lembrete de retorno", "João Gabriel Santos – 22/09", "Ontem, 17:20", false));
    }

    private static Consulta consulta(String id, String pacienteId, String horario, String tipo, StatusConsulta status) {
        return new Consulta(id, MEDICO_ID, pacienteId, DATA_REFERENCIA, LocalTime.parse(horario), tipo, status);
    }
}
