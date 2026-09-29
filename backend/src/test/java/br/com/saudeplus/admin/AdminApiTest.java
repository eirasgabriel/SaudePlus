package br.com.saudeplus.admin;

import static org.hamcrest.Matchers.contains;
import static org.hamcrest.Matchers.containsInAnyOrder;
import static org.hamcrest.Matchers.hasItem;
import static org.hamcrest.Matchers.hasSize;
import static org.hamcrest.Matchers.not;
import static org.hamcrest.Matchers.startsWith;
import static org.springframework.security.test.web.servlet.setup.SecurityMockMvcConfigurers.springSecurity;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.time.Clock;
import java.time.LocalDate;
import java.time.YearMonth;
import java.util.UUID;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.ResultActions;
import org.springframework.test.web.servlet.request.MockHttpServletRequestBuilder;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.context.WebApplicationContext;

import br.com.saudeplus.Cenarios;
import br.com.saudeplus.TesteDeIntegracao;
import br.com.saudeplus.agendamentos.Agendamento;
import br.com.saudeplus.agendamentos.StatusAgendamento;
import br.com.saudeplus.notificacoes.NotificacaoService;
import br.com.saudeplus.notificacoes.TipoNotificacao;
import br.com.saudeplus.pacientes.Paciente;
import br.com.saudeplus.profissionais.Medico;
import br.com.saudeplus.usuarios.Papel;
import tools.jackson.databind.json.JsonMapper;
import tools.jackson.databind.node.ObjectNode;

/**
 * Área administrativa de ponta a ponta. Permissões e configurações são estado
 * global do banco compartilhado entre as classes de teste: quem muda,
 * restaura no `finally`.
 */
@TesteDeIntegracao
class AdminApiTest {

    /** CPFs válidos (dígitos verificadores corretos), usados só aqui. */
    private static final String CPF_VALIDO = "529.982.247-25";

    @Autowired
    private WebApplicationContext contexto;
    @Autowired
    private JsonMapper json;
    @Autowired
    private Clock relogio;
    @Autowired
    private NotificacaoService notificador;

    private MockMvc mvc;
    private Cenarios cenarios;
    private String admin;
    private UUID adminId;
    private UUID clinicoGeral;

    @BeforeEach
    void preparar() throws Exception {
        mvc = MockMvcBuilders.webAppContextSetup(contexto).apply(springSecurity()).build();
        cenarios = new Cenarios(contexto);
        var conta = cenarios.usuario("Administração de Teste", Papel.ADMIN);
        adminId = conta.getId();
        admin = cenarios.bearer(conta);
        String lista = mvc.perform(get("/api/publico/especialidades")).andReturn().getResponse().getContentAsString();
        for (var item : json.readTree(lista)) {
            if ("clinico-geral".equals(item.get("slug").asString())) {
                clinicoGeral = UUID.fromString(item.get("id").asString());
            }
        }
    }

    private ResultActions como(String bearer, MockHttpServletRequestBuilder requisicao) throws Exception {
        return mvc.perform(requisicao.header(HttpHeaders.AUTHORIZATION, bearer));
    }

    private static MockHttpServletRequestBuilder json(MockHttpServletRequestBuilder requisicao, String corpo) {
        return requisicao.contentType(MediaType.APPLICATION_JSON).content(corpo);
    }

    private static String email() {
        return "adm-" + UUID.randomUUID() + "@teste.saudeplus.com";
    }

    @Test
    void edicaoRedefineSenhaERejeitaSenhaInvalida() throws Exception {
        var alvo = cenarios.usuario("Pessoa Teste", Papel.RECEPCIONISTA);
        String corpo = """
                {"nomeCompleto":"Pessoa Teste","papel":"RECEPCIONISTA","novaSenha":"%s"}
                """;
        for (String invalida : new String[] { "curta", "        ", "a".repeat(73) }) {
            como(admin, json(put("/api/admin/usuarios/{id}", alvo.getId()), corpo.formatted(invalida)))
                    .andExpect(status().isBadRequest());
        }
        como(admin, json(put("/api/admin/usuarios/{id}", alvo.getId()), corpo.formatted("novaSenha123")))
                .andExpect(status().isOk()).andExpect(jsonPath("$.novaSenha").doesNotExist());
        // Uma edição posterior sem senha preserva a senha definida.
        como(admin, json(put("/api/admin/usuarios/{id}", alvo.getId()),
                """
                {"nomeCompleto":"Pessoa Atualizada","papel":"RECEPCIONISTA"}
                """ )).andExpect(status().isOk());
        mvc.perform(json(post("/api/auth/login"),
                """
                {"email":"%s","senha":"senhaDeTeste1"}
                """.formatted(alvo.getEmail()))).andExpect(status().isUnauthorized());
        mvc.perform(json(post("/api/auth/login"),
                """
                {"email":"%s","senha":"novaSenha123"}
                """.formatted(alvo.getEmail()))).andExpect(status().isOk());
        var gestor = cenarios.usuario("Gestor Teste", Papel.GESTOR);
        como(cenarios.bearer(gestor), json(put("/api/admin/usuarios/{id}", adminId),
                """
                {"nomeCompleto":"Admin Teste","papel":"ADMIN","novaSenha":"novaSenha123"}
                """ )).andExpect(status().isForbidden());
    }

    private String equipe(Papel papel) {
        return cenarios.bearer(cenarios.usuario("Equipe " + papel.name(), papel));
    }

    @Nested
    @DisplayName("Usuários")
    class Usuarios {

        @Test
        @DisplayName("cria médico com CRM, especialidade e unidade; ele aparece na busca pública e a criação é auditada")
        void criaMedico() throws Exception {
            String nome = "Dra. Helena Prado " + UUID.randomUUID().toString().substring(0, 6);
            String crm = String.valueOf(100_000 + (int) (Math.random() * 800_000));
            como(admin, json(post("/api/admin/usuarios"), """
                    {"nomeCompleto":"%s","email":"%s","telefone":"(22) 99999-0000","cpf":"52998224725","papel":"MEDICO",
                     "medico":{"crm":"%s","crmUf":"rj","especialidadeIds":["%s"],"unidadeIds":["%s"],"valorConsulta":200}}"""
                    .formatted(nome, email(), crm, clinicoGeral, Cenarios.UNIDADE_CENTRO)))
                    .andExpect(status().isCreated())
                    .andExpect(jsonPath("$.papel").value("MEDICO"))
                    .andExpect(jsonPath("$.cpf").value(CPF_VALIDO))
                    .andExpect(jsonPath("$.medico.crmUf").value("RJ"))
                    .andExpect(jsonPath("$.medico.especialidades[0].nome").value("Clínico Geral"))
                    .andExpect(jsonPath("$.medico.unidades[0].nome").value("Clínica da Família – Centro"));

            mvc.perform(get("/api/publico/profissionais").param("q", nome))
                    .andExpect(jsonPath("$.conteudo[0].nome").value(nome));
            como(admin, get("/api/admin/auditoria").param("acao", "usuario.criar").param("usuarioId", adminId.toString()))
                    .andExpect(jsonPath("$.conteudo[0].acao").value("usuario.criar"))
                    .andExpect(jsonPath("$.conteudo[0].detalhe.papel").value("MEDICO"))
                    .andExpect(jsonPath("$.conteudo[0].usuario.nome").value("Administração de Teste"));
        }

        @Test
        @DisplayName("médico sem CRM 400, CPF inválido 400, e-mail repetido 409")
        void validacoes() throws Exception {
            como(admin, json(post("/api/admin/usuarios"),
                    "{\"nomeCompleto\":\"Dr. Sem Crm\",\"email\":\"%s\",\"papel\":\"MEDICO\"}".formatted(email())))
                    .andExpect(status().isBadRequest())
                    .andExpect(jsonPath("$.campos.medico").exists());
            como(admin, json(post("/api/admin/usuarios"),
                    "{\"nomeCompleto\":\"Cpf Errado\",\"email\":\"%s\",\"cpf\":\"111.222.333-44\",\"papel\":\"RECEPCIONISTA\"}"
                            .formatted(email())))
                    .andExpect(status().isBadRequest())
                    .andExpect(jsonPath("$.campos.cpf").exists());
            como(admin, json(post("/api/admin/usuarios"),
                    "{\"nomeCompleto\":\"Repetido\",\"email\":\"admin@saudeplus.com\",\"papel\":\"GESTOR\"}"))
                    .andExpect(status().isConflict());
        }

        @Test
        @DisplayName("gestor cria equipe, mas não cria nem promove administrador")
        void semEscalada() throws Exception {
            String gestor = equipe(Papel.GESTOR);
            como(gestor, json(post("/api/admin/usuarios"),
                    "{\"nomeCompleto\":\"Novo Admin\",\"email\":\"%s\",\"papel\":\"ADMIN\"}".formatted(email())))
                    .andExpect(status().isForbidden());
            String corpo = como(gestor, json(post("/api/admin/usuarios"),
                    "{\"nomeCompleto\":\"Nova Recepção\",\"email\":\"%s\",\"papel\":\"RECEPCIONISTA\"}".formatted(email())))
                    .andExpect(status().isCreated())
                    .andReturn().getResponse().getContentAsString();
            String id = json.readTree(corpo).get("id").asString();
            como(gestor, json(put("/api/admin/usuarios/{id}", id),
                    "{\"nomeCompleto\":\"Nova Recepção\",\"papel\":\"ADMIN\"}"))
                    .andExpect(status().isForbidden());
        }

        @Test
        @DisplayName("bloqueio vale na hora e ninguém bloqueia a si mesmo")
        void bloqueio() throws Exception {
            var alvo = cenarios.usuario("Pessoa Bloqueável", Papel.RECEPCIONISTA);
            String tokenDoAlvo = cenarios.bearer(alvo);
            como(admin, json(patch("/api/admin/usuarios/{id}/status", alvo.getId()), "{\"status\":\"bloqueado\"}"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.status").value("bloqueado"));
            como(tokenDoAlvo, get("/api/auth/perfil")).andExpect(status().isUnauthorized());

            como(admin, json(patch("/api/admin/usuarios/{id}/status", adminId), "{\"status\":\"bloqueado\"}"))
                    .andExpect(status().isUnprocessableContent());
        }

        @Test
        @DisplayName("excluir é lógico: a conta fica inativa e para de entrar; ninguém exclui a si mesmo")
        void excluir() throws Exception {
            var alvo = cenarios.usuario("Pessoa Excluível", Papel.RECEPCIONISTA);
            String tokenDoAlvo = cenarios.bearer(alvo);
            como(admin, delete("/api/admin/usuarios/{id}", alvo.getId())).andExpect(status().isNoContent());
            como(admin, get("/api/admin/usuarios/{id}", alvo.getId())).andExpect(jsonPath("$.status").value("inativo"));
            como(tokenDoAlvo, get("/api/auth/perfil")).andExpect(status().isUnauthorized());

            como(admin, delete("/api/admin/usuarios/{id}", adminId)).andExpect(status().isUnprocessableContent());
            como(equipe(Papel.GESTOR), delete("/api/admin/usuarios/{id}", adminId)).andExpect(status().isForbidden());
            mvc.perform(delete("/api/admin/usuarios/{id}", alvo.getId())).andExpect(status().isUnauthorized());
        }

        @Test
        @DisplayName("médico não vira outro perfil")
        void perfilFixo() throws Exception {
            Medico medico = cenarios.medico();
            como(admin, json(put("/api/admin/usuarios/{id}", medico.getUsuario().getId()),
                    "{\"nomeCompleto\":\"%s\",\"papel\":\"GESTOR\"}".formatted(medico.getUsuario().getNomeCompleto())))
                    .andExpect(status().isUnprocessableContent());
        }

        @Test
        @DisplayName("lista filtra por papel e busca; métricas contam as contas")
        void listaEMetricas() throws Exception {
            como(admin, get("/api/admin/usuarios").param("papel", "ADMIN").param("q", "administração de teste"))
                    .andExpect(jsonPath("$.conteudo[*].papel", not(hasItem("PACIENTE"))))
                    .andExpect(jsonPath("$.conteudo[*].id", hasItem(adminId.toString())));
            como(admin, get("/api/admin/usuarios/metricas"))
                    .andExpect(jsonPath("$.total").isNumber())
                    .andExpect(jsonPath("$.novosNoMes").isNumber());
        }
    }

    @Nested
    @DisplayName("Permissões")
    class Permissoes {

        @Test
        @DisplayName("equipe entra só nos módulos liberados; permissões e auditoria são só do ADMIN")
        void porModulo() throws Exception {
            String recepcao = equipe(Papel.RECEPCIONISTA);
            como(recepcao, get("/api/admin/agendamentos")).andExpect(status().isOk());
            como(recepcao, get("/api/admin/unidades")).andExpect(status().isForbidden());
            como(recepcao, get("/api/admin/permissoes")).andExpect(status().isForbidden());
            como(recepcao, get("/api/admin/auditoria")).andExpect(status().isForbidden());
            como(recepcao, get("/api/auth/modulos"))
                    .andExpect(jsonPath("$", containsInAnyOrder("dashboard", "agendamentos", "relatorios")));
            como(recepcao, get("/api/admin/usuarios")).andExpect(status().isForbidden());
            como(admin, get("/api/auth/modulos")).andExpect(jsonPath("$", hasSize(7)));

            String paciente = cenarios.bearer(cenarios.paciente("Paciente Curioso", null).getUsuario());
            como(paciente, get("/api/admin/dashboard")).andExpect(status().isForbidden());
            como(paciente, get("/api/auth/modulos")).andExpect(jsonPath("$", hasSize(0)));
        }

        @Test
        @DisplayName("tirar um módulo da matriz barra a equipe na próxima requisição")
        void alterarMatriz() throws Exception {
            String original = como(admin, get("/api/admin/permissoes")).andReturn().getResponse().getContentAsString();
            String matrizOriginal = json.writeValueAsString(json.readTree(original).get("matriz"));
            String recepcao = equipe(Papel.RECEPCIONISTA);
            try {
                var matriz = json.readTree(original).get("matriz").deepCopy();
                ((ObjectNode) matriz.get("agendamentos")).put("RECEPCIONISTA", false);
                como(admin, json(put("/api/admin/permissoes"), json.writeValueAsString(matriz)))
                        .andExpect(status().isOk())
                        .andExpect(jsonPath("$.matriz.agendamentos.RECEPCIONISTA").value(false));
                como(recepcao, get("/api/admin/agendamentos")).andExpect(status().isForbidden());
                como(admin, json(put("/api/admin/permissoes"), "{\"agendamentos\":{\"PACIENTE\":true}}"))
                        .andExpect(status().isBadRequest());
            } finally {
                como(admin, json(put("/api/admin/permissoes"), matrizOriginal)).andExpect(status().isOk());
            }
            como(recepcao, get("/api/admin/agendamentos")).andExpect(status().isOk());
        }
    }

    @Nested
    @DisplayName("Configurações")
    class Configuracoes {

        @Test
        @DisplayName("antecedência mínima gravada pela administração vale para os horários públicos")
        void regrasDaAgenda() throws Exception {
            String roberto = "c1000000-0000-4000-8000-000000000001";
            LocalDate hoje = LocalDate.now(relogio);
            String original = como(admin, get("/api/admin/configuracoes")).andReturn().getResponse().getContentAsString();
            String agendaOriginal = json.writeValueAsString(json.readTree(original).get("agendamento"));
            try {
                como(admin, json(put("/api/admin/configuracoes/agendamento"),
                        "{\"antecedenciaMinimaHoras\":72,\"antecedenciaCancelamentoHoras\":24,\"janelaAgendamentoDias\":60}"))
                        .andExpect(status().isOk());
                mvc.perform(get("/api/publico/profissionais/{id}/horarios", roberto)
                                .param("de", hoje.toString()).param("ate", hoje.plusDays(2).toString()))
                        .andExpect(jsonPath("$", hasSize(0)));
                como(admin, json(put("/api/admin/configuracoes/agendamento"), "{\"antecedenciaMinimaHoras\":-1}"))
                        .andExpect(status().isBadRequest())
                        .andExpect(jsonPath("$.campos.antecedenciaMinimaHoras").exists());
                como(admin, json(put("/api/admin/configuracoes/inventado"), "{}")).andExpect(status().isNotFound());
            } finally {
                como(admin, json(put("/api/admin/configuracoes/agendamento"), agendaOriginal)).andExpect(status().isOk());
            }
        }
    }

    @Nested
    @DisplayName("Unidades e catálogos")
    class Cadastros {

        @Test
        @DisplayName("unidade nova entra na lista; em manutenção sai da busca pública")
        void unidade() throws Exception {
            String nome = "UBS Teste " + UUID.randomUUID().toString().substring(0, 6);
            String corpo = como(admin, json(post("/api/admin/unidades"), """
                    {"nome":"%s","endereco":"Rua Nova, 10","bairro":"Centro","cidade":"Araruama","uf":"rj"}""".formatted(nome)))
                    .andExpect(status().isCreated())
                    .andExpect(jsonPath("$.uf").value("RJ"))
                    .andExpect(jsonPath("$.status").value("ativa"))
                    .andReturn().getResponse().getContentAsString();
            String id = json.readTree(corpo).get("id").asString();
            mvc.perform(get("/api/publico/unidades")).andExpect(jsonPath("$[*].nome", hasItem(nome)));

            como(admin, json(patch("/api/admin/unidades/{id}/status", id), "{\"status\":\"manutencao\"}"))
                    .andExpect(jsonPath("$.status").value("manutencao"));
            mvc.perform(get("/api/publico/unidades")).andExpect(jsonPath("$[*].nome", not(hasItem(nome))));
            como(admin, get("/api/admin/unidades")).andExpect(jsonPath("$[*].nome", hasItem(nome)));
            como(admin, get("/api/admin/unidades/metricas")).andExpect(jsonPath("$.manutencao").isNumber());
        }

        @Test
        @DisplayName("CNPJ é validado, gravado formatado e único; e-mail inválido dá 400")
        void cnpjEEmail() throws Exception {
            String corpo = """
                    {"nome":"UBS Com CNPJ","endereco":"Rua A, 1","cidade":"Araruama","uf":"RJ",
                     "cnpj":"%s","email":"%s"}""";
            String criada = como(admin, json(post("/api/admin/unidades"), corpo.formatted("11222333000181", "UBS@Teste.com")))
                    .andExpect(status().isCreated())
                    .andExpect(jsonPath("$.cnpj").value("11.222.333/0001-81"))
                    .andExpect(jsonPath("$.email").value("ubs@teste.com"))
                    .andReturn().getResponse().getContentAsString();
            como(admin, json(post("/api/admin/unidades"), corpo.formatted("11.222.333/0001-81", "outra@teste.com")))
                    .andExpect(status().isConflict());
            como(admin, json(post("/api/admin/unidades"), corpo.formatted("11.222.333/0001-80", "outra@teste.com")))
                    .andExpect(status().isBadRequest())
                    .andExpect(jsonPath("$.campos.cnpj").exists());
            como(admin, json(post("/api/admin/unidades"), corpo.formatted("", "sem-arroba")))
                    .andExpect(status().isBadRequest())
                    .andExpect(jsonPath("$.campos.email").exists());

            // Alterar a própria unidade mantendo o CNPJ não é conflito.
            String id = json.readTree(criada).get("id").asString();
            como(admin, json(put("/api/admin/unidades/{id}", id), corpo.formatted("11222333000181", "nova@teste.com")))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.email").value("nova@teste.com"));
        }

        @Test
        @DisplayName("excluir unidade a deixa inativa; quem não tem o módulo recebe 403")
        void excluirUnidade() throws Exception {
            String corpo = como(admin, json(post("/api/admin/unidades"),
                    "{\"nome\":\"UBS Excluível\",\"endereco\":\"Rua B, 2\",\"cidade\":\"Araruama\",\"uf\":\"RJ\"}"))
                    .andReturn().getResponse().getContentAsString();
            String id = json.readTree(corpo).get("id").asString();

            como(equipe(Papel.RECEPCIONISTA), delete("/api/admin/unidades/{id}", id)).andExpect(status().isForbidden());
            como(admin, delete("/api/admin/unidades/{id}", id)).andExpect(status().isNoContent());
            como(admin, get("/api/admin/unidades"))
                    .andExpect(jsonPath("$[?(@.id == '%s')].status".formatted(id), contains("inativa")));
            como(admin, delete("/api/admin/unidades/{id}", UUID.randomUUID())).andExpect(status().isNotFound());
        }

        @Test
        @DisplayName("especialidade nova ganha slug; repetida dá 409")
        void especialidade() throws Exception {
            como(admin, json(post("/api/admin/especialidades"), "{\"nome\":\"Medicina Esportiva\"}"))
                    .andExpect(status().isCreated())
                    .andExpect(jsonPath("$.slug").value("medicina-esportiva"));
            como(admin, json(post("/api/admin/especialidades"), "{\"nome\":\"Medicina esportiva\"}"))
                    .andExpect(status().isConflict());
            mvc.perform(get("/api/publico/especialidades"))
                    .andExpect(jsonPath("$[*].slug", hasItem("medicina-esportiva")));
        }
    }

    @Nested
    @DisplayName("Notificações da equipe")
    class Notificacoes {

        @Test
        @DisplayName("cada um vê, conta e marca só as suas; notificação alheia dá 404")
        void isolamento() throws Exception {
            var recepcionista = cenarios.usuario("Recepção Notificada", Papel.RECEPCIONISTA);
            var gestor = cenarios.usuario("Gestão Notificada", Papel.GESTOR);
            notificador.notificar(recepcionista, TipoNotificacao.SISTEMA, "Aviso da recepção", "Detalhe");
            notificador.notificar(recepcionista, TipoNotificacao.AGENDAMENTO, "Novo agendamento", null);
            notificador.notificar(gestor, TipoNotificacao.SISTEMA, "Aviso da gestão", null);
            String recepcao = cenarios.bearer(recepcionista);
            String gestao = cenarios.bearer(gestor);

            String lista = como(recepcao, get("/api/admin/notificacoes"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$", hasSize(2)))
                    .andExpect(jsonPath("$[*].titulo", not(hasItem("Aviso da gestão"))))
                    .andReturn().getResponse().getContentAsString();
            como(recepcao, get("/api/admin/notificacoes/nao-lidas")).andExpect(jsonPath("$.total").value(2));

            String daRecepcao = json.readTree(lista).get(0).get("id").asString();
            como(gestao, patch("/api/admin/notificacoes/{id}/lida", daRecepcao)).andExpect(status().isNotFound());
            como(recepcao, patch("/api/admin/notificacoes/{id}/lida", daRecepcao))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.lida").value(true));
            como(recepcao, get("/api/admin/notificacoes/nao-lidas")).andExpect(jsonPath("$.total").value(1));

            como(recepcao, patch("/api/admin/notificacoes/lidas")).andExpect(status().isNoContent());
            como(recepcao, get("/api/admin/notificacoes/nao-lidas")).andExpect(jsonPath("$.total").value(0));
            como(gestao, get("/api/admin/notificacoes/nao-lidas")).andExpect(jsonPath("$.total").value(1));
        }

        @Test
        @DisplayName("sem token 401; médico e paciente usam as próprias áreas (403 aqui)")
        void acesso() throws Exception {
            mvc.perform(get("/api/admin/notificacoes")).andExpect(status().isUnauthorized());
            como(cenarios.bearer(cenarios.medico()), get("/api/admin/notificacoes")).andExpect(status().isForbidden());
            como(cenarios.bearer(cenarios.paciente("Paciente Intruso", null).getUsuario()), get("/api/admin/notificacoes"))
                    .andExpect(status().isForbidden());
        }
    }

    @Nested
    @DisplayName("Formas de pagamento")
    class FormasDePagamento {

        @Test
        @DisplayName("forma desativada não serve para dar baixa; lista vazia dá 400; recepção não altera")
        void ativarEDesativar() throws Exception {
            Paciente paciente = cenarios.paciente("Pagante Teste", null);
            String cobranca = como(admin, json(post("/api/admin/financeiro/transacoes"),
                    "{\"pacienteId\":\"%s\",\"descricao\":\"Taxa\",\"valor\":50}".formatted(paciente.getId())))                    .andExpect(status().isCreated())
                    .andReturn().getResponse().getContentAsString();
            String id = json.readTree(cobranca).get("id").asString();
            try {
                como(admin, json(put("/api/admin/financeiro/formas-pagamento"), "{\"ativas\":[\"pix\",\"credito\"]}"))
                        .andExpect(status().isOk())
                        .andExpect(jsonPath("$", hasSize(6)))
                        .andExpect(jsonPath("$[?(@.forma == 'boleto')].ativa", contains(false)))
                        .andExpect(jsonPath("$[?(@.forma == 'pix')].ativa", contains(true)));
                como(admin, json(patch("/api/admin/financeiro/transacoes/{id}/status", id),
                        "{\"status\":\"pago\",\"forma\":\"boleto\"}"))
                        .andExpect(status().isUnprocessableContent());
                como(admin, json(patch("/api/admin/financeiro/transacoes/{id}/status", id),
                        "{\"status\":\"pago\",\"forma\":\"pix\"}"))
                        .andExpect(status().isOk())
                        .andExpect(jsonPath("$.status").value("pago"));

                como(admin, json(put("/api/admin/financeiro/formas-pagamento"), "{\"ativas\":[]}"))
                        .andExpect(status().isBadRequest())
                        .andExpect(jsonPath("$.campos.ativas").exists());
                como(admin, json(put("/api/admin/financeiro/formas-pagamento"), "{\"ativas\":[\"cheque\"]}"))
                        .andExpect(status().isBadRequest());
                como(equipe(Papel.RECEPCIONISTA), json(put("/api/admin/financeiro/formas-pagamento"),
                        "{\"ativas\":[\"pix\"]}"))
                        .andExpect(status().isForbidden());
            } finally {
                como(admin, json(put("/api/admin/financeiro/formas-pagamento"),
                        "{\"ativas\":[\"credito\",\"debito\",\"pix\",\"boleto\",\"dinheiro\",\"convenio\"]}"))
                        .andExpect(status().isOk());
            }
        }
    }

    @Nested
    @DisplayName("Informações do sistema")
    class Sistema {

        @Test
        @DisplayName("ADMIN vê banco e última migração; a equipe não")
        void informacoes() throws Exception {
            como(admin, get("/api/admin/sistema"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.banco").value(startsWith("PostgreSQL")))
                    .andExpect(jsonPath("$.ultimaMigracao.versao").value("7"))
                    .andExpect(jsonPath("$.noArDesde").isString());
            como(equipe(Papel.GESTOR), get("/api/admin/sistema")).andExpect(status().isForbidden());
        }
    }

    @Nested
    @DisplayName("Agendamentos e dashboard")
    class Operacao {

        @Test
        @DisplayName("lista, calendário e confirmação pela recepção")
        void agendamentos() throws Exception {
            Medico medico = cenarios.medico();
            Paciente paciente = cenarios.paciente("Rosa Lima Teste", null);
            LocalDate dia = LocalDate.now(relogio).plusDays(3);
            Agendamento agendamento = cenarios.agendamento(medico, paciente, dia, "09:00", StatusAgendamento.PENDENTE);
            String recepcao = equipe(Papel.RECEPCIONISTA);

            como(recepcao, get("/api/admin/agendamentos").param("q", "rosa lima").param("de", dia.toString()))
                    .andExpect(jsonPath("$.conteudo[*].id", contains(agendamento.getId().toString())))
                    .andExpect(jsonPath("$.conteudo[0].medico.crm").value("CRM " + medico.getCrm() + "-RJ"));
            como(recepcao, json(patch("/api/admin/agendamentos/{id}/status", agendamento.getId()), "{\"status\":\"confirmada\"}"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.status").value("confirmada"));
            como(recepcao, get("/api/admin/agendamentos/calendario").param("mes", YearMonth.from(dia).toString()))
                    .andExpect(jsonPath("$.dias['%d'].consultas".formatted(dia.getDayOfMonth())).isNumber());
            como(recepcao, get("/api/admin/agendamentos/metricas").param("de", dia.toString()).param("ate", dia.toString()))
                    .andExpect(jsonPath("$.porStatus.confirmada").isNumber());
        }

        @Test
        @DisplayName("dashboard traz métricas, série mensal, ranking e últimos agendamentos")
        void dashboard() throws Exception {
            como(admin, get("/api/admin/dashboard").param("meses", "6"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.metricas.usuariosCadastrados").isNumber())
                    .andExpect(jsonPath("$.metricas.agendamentos.atual").isNumber())
                    .andExpect(jsonPath("$.agendamentosPorMes", hasSize(6)))
                    .andExpect(jsonPath("$.agendamentosPorMes[5].mes").value(YearMonth.now(relogio).toString()))
                    .andExpect(jsonPath("$.tiposDeAtendimento.consultas").isNumber())
                    .andExpect(jsonPath("$.ultimosAgendamentos").isArray());
        }
    }
}
