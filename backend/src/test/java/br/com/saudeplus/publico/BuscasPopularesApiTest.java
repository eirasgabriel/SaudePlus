package br.com.saudeplus.publico;

import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.contains;
import static org.hamcrest.Matchers.hasSize;
import static org.springframework.security.test.web.servlet.setup.SecurityMockMvcConfigurers.springSecurity;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.time.LocalDate;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.request.MockHttpServletRequestBuilder;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.context.WebApplicationContext;

import br.com.saudeplus.TesteDeIntegracao;

/**
 * "Buscas populares": a busca pública conta o filtro de especialidade e
 * GET /api/publico/buscas-populares devolve as mais buscadas. Começa cada teste
 * com a tabela vazia, porque outras classes também fazem buscas.
 */
@TesteDeIntegracao
class BuscasPopularesApiTest {

    @Autowired
    private WebApplicationContext contexto;

    @Autowired
    private JdbcTemplate jdbc;

    private MockMvc mvc;

    @BeforeEach
    void preparar() {
        mvc = MockMvcBuilders.webAppContextSetup(contexto).apply(springSecurity()).build();
        jdbc.update("DELETE FROM buscas_por_especialidade");
    }

    private void buscar(String... especialidades) throws Exception {
        MockHttpServletRequestBuilder pedido = get("/api/publico/profissionais");
        for (String slug : especialidades) {
            pedido = pedido.param("especialidade", slug);
        }
        mvc.perform(pedido).andExpect(status().isOk());
    }

    private void buscarVezes(int vezes, String slug) throws Exception {
        for (int i = 0; i < vezes; i++) {
            buscar(slug);
        }
    }

    private int total(String slug) {
        Integer soma = jdbc.queryForObject("""
                SELECT COALESCE(SUM(b.total), 0) FROM buscas_por_especialidade b
                JOIN especialidades e ON e.id = b.especialidade_id WHERE e.slug = ?
                """, Integer.class, slug);
        return soma == null ? 0 : soma;
    }

    @Test
    @DisplayName("sem buscas suficientes, a lista vem vazia")
    void vazia() throws Exception {
        buscarVezes(BuscasPopularesService.MINIMO_DE_BUSCAS - 1, "cardiologia");
        mvc.perform(get("/api/publico/buscas-populares"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(0)));
    }

    @Test
    @DisplayName("ordena da mais buscada para a menos e respeita o limite")
    void ordem() throws Exception {
        buscarVezes(5, "pediatria");
        buscarVezes(4, "cardiologia");
        buscarVezes(3, "dermatologia");

        mvc.perform(get("/api/publico/buscas-populares"))
                .andExpect(jsonPath("$[*].slug", contains("pediatria", "cardiologia", "dermatologia")))
                .andExpect(jsonPath("$[0].nome").value("Pediatria"));
        mvc.perform(get("/api/publico/buscas-populares").param("limite", "2"))
                .andExpect(jsonPath("$[*].slug", contains("pediatria", "cardiologia")));
    }

    @Test
    @DisplayName("devolve no máximo o top 10, mesmo pedindo mais")
    void top10() throws Exception {
        java.util.List<String> slugs = jdbc.queryForList("SELECT slug FROM especialidades ORDER BY nome LIMIT 11", String.class);
        assertThat(slugs).hasSize(11);
        for (int i = 0; i < slugs.size(); i++) {
            buscarVezes(i + 1, slugs.get(i));
        }
        mvc.perform(get("/api/publico/buscas-populares").param("limite", "50"))
                .andExpect(jsonPath("$", hasSize(BuscasPopularesService.LIMITE_MAXIMO)))
                .andExpect(jsonPath("$[0].slug").value(slugs.get(10)));
    }

    @Test
    @DisplayName("não conta outras páginas, termo livre, slug desconhecido nem filtro com muitas especialidades")
    void oQueNaoConta() throws Exception {
        mvc.perform(get("/api/publico/profissionais").param("especialidade", "cardiologia").param("pagina", "1"))
                .andExpect(status().isOk());
        mvc.perform(get("/api/publico/profissionais").param("q", "cardiologia")).andExpect(status().isOk());
        buscar("nao-existe");
        buscar("cardiologia", "pediatria", "dermatologia", "ortopedia");

        assertThat(jdbc.queryForObject("SELECT count(*) FROM buscas_por_especialidade", Integer.class)).isZero();
    }

    @Test
    @DisplayName("a mesma especialidade repetida na busca conta uma vez; várias contam cada uma")
    void repeticao() throws Exception {
        buscar("cardiologia", "cardiologia");
        buscar("cardiologia", "pediatria");
        assertThat(total("cardiologia")).isEqualTo(2);
        assertThat(total("pediatria")).isEqualTo(1);
    }

    @Test
    @DisplayName("buscas de mais de 30 dias atrás não entram")
    void janela() throws Exception {
        jdbc.update("""
                INSERT INTO buscas_por_especialidade (especialidade_id, dia, total)
                SELECT id, ?, 50 FROM especialidades WHERE slug = 'ortopedia'
                """, LocalDate.now().minusDays(BuscasPopularesService.DIAS + 5));
        buscarVezes(3, "cardiologia");

        mvc.perform(get("/api/publico/buscas-populares"))
                .andExpect(jsonPath("$[*].slug", contains("cardiologia")));
    }
}
