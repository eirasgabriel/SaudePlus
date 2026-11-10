package br.com.saudeplus.publico;

import static org.hamcrest.Matchers.contains;
import static org.hamcrest.Matchers.containsInAnyOrder;
import static org.hamcrest.Matchers.hasItems;
import static org.hamcrest.Matchers.hasSize;
import static org.hamcrest.Matchers.not;
import static org.hamcrest.Matchers.hasItem;
import static org.springframework.security.test.web.servlet.setup.SecurityMockMvcConfigurers.springSecurity;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.temporal.TemporalAdjusters;
import java.util.UUID;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.context.WebApplicationContext;

import br.com.saudeplus.TesteDeIntegracao;
import br.com.saudeplus.usuarios.StatusConta;
import br.com.saudeplus.usuarios.Usuario;
import br.com.saudeplus.usuarios.UsuarioRepository;

/**
 * Busca pública contra os dados de `db/demo/R__dados_demonstracao.sql`. Sem
 * token em nenhuma chamada: estas rotas são abertas.
 */
@TesteDeIntegracao
class PublicoApiTest {

    private static final String ROBERTO = "c1000000-0000-4000-8000-000000000001";
    private static final String UNIDADE_EM_REFORMA = "a1000000-0000-4000-8000-000000000010";

    @Autowired
    private WebApplicationContext contexto;

    @Autowired
    private UsuarioRepository usuarios;

    private MockMvc mockMvc;

    private MockMvc mvc() {
        if (mockMvc == null) {
            mockMvc = MockMvcBuilders.webAppContextSetup(contexto).apply(springSecurity()).build();
        }
        return mockMvc;
    }

    @Nested
    @DisplayName("Listas de apoio")
    class Catalogo {

        @Test
        @DisplayName("especialidades vêm todas, em ordem de nome")
        void especialidades() throws Exception {
            mvc().perform(get("/api/publico/especialidades"))
                    .andExpect(status().isOk())
                    // Outras classes de teste criam especialidades no banco compartilhado: confere as do V2, não o total.
                    .andExpect(jsonPath("$[0].nome").value("Cardiologia"))
                    .andExpect(jsonPath("$[*].slug", hasItems("cardiologia", "clinico-geral", "nutricao")));
        }

        @Test
        @DisplayName("convênios ativos")
        void convenios() throws Exception {
            mvc().perform(get("/api/publico/convenios"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$[*].nome", contains("Amil", "Bradesco Saúde", "SulAmérica", "Unimed")));
        }

        @Test
        @DisplayName("cidades vêm com o rótulo do filtro do front")
        void cidades() throws Exception {
            mvc().perform(get("/api/publico/cidades"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$[*].rotulo", hasItems(
                            "São Paulo - SP", "Rio de Janeiro - RJ", "Belo Horizonte - MG", "Curitiba - PR", "Saquarema - RJ")));
        }

        @Test
        @DisplayName("unidades da cidade deixam de fora a que está em manutenção")
        void unidadesDaCidade() throws Exception {
            mvc().perform(get("/api/publico/unidades").param("cidade", "Saquarema").param("uf", "RJ"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$[*].nome", containsInAnyOrder("Clínica da Família – Centro", "UBS Jaconé")));
            mvc().perform(get("/api/publico/unidades/{id}", UNIDADE_EM_REFORMA))
                    .andExpect(status().isNotFound());
        }
    }

    @Nested
    @DisplayName("GET /api/publico/profissionais")
    class Busca {

        @Test
        @DisplayName("filtra por cidade e ordena por relevância (mais avaliações)")
        void porCidade() throws Exception {
            mvc().perform(get("/api/publico/profissionais").param("cidade", "São Paulo").param("uf", "SP"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.totalElementos").value(4))
                    .andExpect(jsonPath("$.conteudo[*].nome", contains(
                            "Dr. Marcelo Santos", "Dr. Roberto Almeida", "Dra. Fernanda Lima", "Dra. Juliana Castro")))
                    .andExpect(jsonPath("$.conteudo[1].local.bairro").value("Bela Vista"))
                    .andExpect(jsonPath("$.conteudo[1].modalidades", contains("presencial", "online")))
                    .andExpect(jsonPath("$.conteudo[1].fotoUrl").value("/images/profissionais/dr-roberto-almeida.jpg"))
                    // Janelas de segunda a sexta: sempre há horário livre nas próximas duas semanas.
                    .andExpect(jsonPath("$.conteudo[1].proximaData").isNotEmpty())
                    .andExpect(jsonPath("$.conteudo[1].proximosHorarios", hasSize(6)));
        }

        @Test
        @DisplayName("ordem por avaliação desempata pelo número de avaliações")
        void porAvaliacao() throws Exception {
            mvc().perform(get("/api/publico/profissionais")
                            .param("cidade", "São Paulo").param("uf", "SP").param("ordem", "avaliacao"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.conteudo[*].nome", contains(
                            "Dr. Marcelo Santos", "Dr. Roberto Almeida", "Dra. Fernanda Lima", "Dra. Juliana Castro")));
        }

        @Test
        @DisplayName("várias especialidades valem como 'qualquer uma'")
        void especialidades() throws Exception {
            mvc().perform(get("/api/publico/profissionais")
                            .param("especialidade", "cardiologia").param("especialidade", "pediatria"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.conteudo[*].nome",
                            containsInAnyOrder("Dr. Roberto Almeida", "Dra. Juliana Castro")));
        }

        @Test
        @DisplayName("modalidade vem das disponibilidades do médico")
        void modalidade() throws Exception {
            mvc().perform(get("/api/publico/profissionais").param("modalidade", "domiciliar"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.conteudo[*].nome", contains("Dr. Paulo Ribeiro")));
        }

        @Test
        @DisplayName("filtros diferentes se somam: convênio e cidade")
        void convenioECidade() throws Exception {
            mvc().perform(get("/api/publico/profissionais")
                            .param("convenio", "SulAmérica").param("cidade", "São Paulo").param("uf", "SP"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.conteudo[*].nome",
                            containsInAnyOrder("Dr. Marcelo Santos", "Dra. Juliana Castro")));
        }

        @Test
        @DisplayName("termo busca no nome do médico e no nome da especialidade")
        void termo() throws Exception {
            mvc().perform(get("/api/publico/profissionais").param("q", "DERMATO"))
                    .andExpect(jsonPath("$.conteudo[*].nome", contains("Dr. Marcelo Santos")));
            mvc().perform(get("/api/publico/profissionais").param("q", "juliana"))
                    .andExpect(jsonPath("$.conteudo[*].nome", contains("Dra. Juliana Castro")));
        }

        @Test
        @DisplayName("pagina com tamanho informado")
        void paginacao() throws Exception {
            mvc().perform(get("/api/publico/profissionais")
                            .param("cidade", "São Paulo").param("uf", "SP").param("tamanho", "3").param("pagina", "1"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.conteudo", hasSize(1)))
                    .andExpect(jsonPath("$.pagina").value(1))
                    .andExpect(jsonPath("$.totalPaginas").value(2));
        }

        @Test
        @DisplayName("modalidade ou ordenação desconhecida devolve 400")
        void parametroInvalido() throws Exception {
            mvc().perform(get("/api/publico/profissionais").param("modalidade", "teletransporte"))
                    .andExpect(status().isBadRequest());
            mvc().perform(get("/api/publico/profissionais").param("ordem", "preco"))
                    .andExpect(status().isBadRequest());
        }

        @Test
        @DisplayName("conta inicial de médico aparece com o perfil criado na subida")
        void medicoInicial() throws Exception {
            mvc().perform(get("/api/publico/profissionais").param("q", "Carlos Andrade"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.conteudo[0].crm").value("112.233"))
                    .andExpect(jsonPath("$.conteudo[0].crmUf").value("RJ"))
                    .andExpect(jsonPath("$.conteudo[0].especialidades[0].slug").value("clinico-geral"))
                    .andExpect(jsonPath("$.conteudo[0].local.nome").value("Clínica da Família – Centro"));
        }
    }

    @Nested
    @DisplayName("GET /api/publico/profissionais/{id}")
    class Perfil {

        @Test
        @DisplayName("devolve o perfil completo")
        void perfil() throws Exception {
            mvc().perform(get("/api/publico/profissionais/{id}", ROBERTO))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.nome").value("Dr. Roberto Almeida"))
                    .andExpect(jsonPath("$.crm").value("123.456"))
                    .andExpect(jsonPath("$.crmUf").value("SP"))
                    .andExpect(jsonPath("$.valorConsulta").value(250.0))
                    .andExpect(jsonPath("$.convenios", contains("Amil", "Bradesco Saúde", "Unimed")))
                    .andExpect(jsonPath("$.unidades[*].nome", contains("SaudePlus Paulista")));
        }

        @Test
        @DisplayName("horários livres saem na hora gravada no banco, sem deslocamento de fuso")
        void horariosSemDeslocamento() throws Exception {
            // Roberto atende de segunda a sexta, 08:00–12:00, em janelas de 30 min (SQL de demonstração).
            LocalDate segunda = LocalDate.now().plusDays(7).with(TemporalAdjusters.nextOrSame(DayOfWeek.MONDAY));
            mvc().perform(get("/api/publico/profissionais/{id}/horarios", ROBERTO)
                            .param("de", segunda.toString()).param("ate", segunda.toString()))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$[?(@.modalidade == 'presencial')].horario", contains(
                            "08:00", "08:30", "09:00", "09:30", "10:00", "10:30", "11:00", "11:30")));
        }

        @Test
        @DisplayName("id inexistente devolve 404")
        void inexistente() throws Exception {
            mvc().perform(get("/api/publico/profissionais/{id}", UUID.randomUUID()))
                    .andExpect(status().isNotFound());
        }

        @Test
        @DisplayName("médico com a conta bloqueada some do perfil e da busca")
        void contaBloqueada() throws Exception {
            Usuario camila = usuarios.findByEmail("camila.duarte@demo.saudeplus.com").orElseThrow();
            camila.alterarStatus(StatusConta.BLOQUEADO);
            usuarios.save(camila);
            try {
                mvc().perform(get("/api/publico/profissionais/{id}", "c1000000-0000-4000-8000-000000000007"))
                        .andExpect(status().isNotFound());
                mvc().perform(get("/api/publico/profissionais").param("tamanho", "50"))
                        .andExpect(jsonPath("$.conteudo[*].nome", not(hasItem("Dra. Camila Duarte"))));
            } finally {
                camila.alterarStatus(StatusConta.ATIVO);
                usuarios.save(camila);
            }
        }
    }
}
