package br.com.saudeplus.publico;

import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.contains;
import static org.hamcrest.Matchers.hasSize;
import static org.springframework.security.test.web.servlet.setup.SecurityMockMvcConfigurers.springSecurity;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.context.WebApplicationContext;

import br.com.saudeplus.TesteDeIntegracao;

/**
 * "Profissionais em destaque": abrir o perfil público conta uma visualização
 * e GET /api/publico/destaques devolve os perfis mais abertos em 30 dias, no
 * formato do cartão da busca (só quem teve visita). Começa cada teste com a tabela vazia.
 */
@TesteDeIntegracao
class ProfissionaisEmDestaqueApiTest {

    @Autowired
    private WebApplicationContext contexto;

    @Autowired
    private JdbcTemplate jdbc;

    private MockMvc mvc;
    private List<String> ativos;

    @BeforeEach
    void preparar() {
        mvc = MockMvcBuilders.webAppContextSetup(contexto).apply(springSecurity()).build();
        jdbc.update("DELETE FROM visualizacoes_de_perfil");
        ativos = jdbc.queryForList("""
                SELECT m.id::text FROM medicos m JOIN usuarios u ON u.id = m.usuario_id
                WHERE u.status = 'ativo' ORDER BY m.id LIMIT 5
                """, String.class);
        assertThat(ativos).hasSizeGreaterThanOrEqualTo(5);
    }

    private void abrirPerfil(int vezes, String id) throws Exception {
        for (int i = 0; i < vezes; i++) {
            mvc.perform(get("/api/publico/profissionais/{id}", id)).andExpect(status().isOk());
        }
    }

    @Test
    @DisplayName("sem perfis abertos, a lista vem vazia (nada de completar com outros médicos)")
    void semVisitas() throws Exception {
        mvc.perform(get("/api/publico/destaques"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(0)));
    }

    @Test
    @DisplayName("o ranking muda conforme os perfis são abertos")
    void rankingMuda() throws Exception {
        abrirPerfil(2, ativos.get(3));
        mvc.perform(get("/api/publico/destaques")).andExpect(jsonPath("$[*].id", contains(ativos.get(3))));
        abrirPerfil(3, ativos.get(1));
        mvc.perform(get("/api/publico/destaques"))
                .andExpect(jsonPath("$[*].id", contains(ativos.get(1), ativos.get(3))));
    }

    @Test
    @DisplayName("ordena pelos perfis mais abertos, no formato do cartão, e respeita o limite (padrão 4)")
    void ordem() throws Exception {
        abrirPerfil(5, ativos.get(2));
        abrirPerfil(4, ativos.get(0));
        abrirPerfil(3, ativos.get(4));
        abrirPerfil(2, ativos.get(1));
        abrirPerfil(1, ativos.get(3));

        mvc.perform(get("/api/publico/destaques"))
                .andExpect(jsonPath("$[*].id", contains(ativos.get(2), ativos.get(0), ativos.get(4), ativos.get(1))))
                .andExpect(jsonPath("$[0].nome").isString())
                .andExpect(jsonPath("$[0].especialidades").isArray());
        mvc.perform(get("/api/publico/destaques").param("limite", "2"))
                .andExpect(jsonPath("$[*].id", contains(ativos.get(2), ativos.get(0))));
    }

    @Test
    @DisplayName("perfil inexistente não conta; conta inativa some dos destaques")
    void inativos() throws Exception {
        mvc.perform(get("/api/publico/profissionais/{id}", UUID.randomUUID())).andExpect(status().isNotFound());
        assertThat(jdbc.queryForObject("SELECT count(*) FROM visualizacoes_de_perfil", Integer.class)).isZero();

        abrirPerfil(3, ativos.get(0));
        abrirPerfil(1, ativos.get(1));
        String usuario = jdbc.queryForObject("SELECT usuario_id::text FROM medicos WHERE id = ?::uuid", String.class, ativos.get(0));
        jdbc.update("UPDATE usuarios SET status = 'inativo' WHERE id = ?::uuid", usuario);
        try {
            mvc.perform(get("/api/publico/destaques"))
                    .andExpect(jsonPath("$[*].id", contains(ativos.get(1))));
        } finally {
            jdbc.update("UPDATE usuarios SET status = 'ativo' WHERE id = ?::uuid", usuario);
        }
    }

    @Test
    @DisplayName("aberturas de mais de 30 dias atrás não entram")
    void janela() throws Exception {
        jdbc.update("INSERT INTO visualizacoes_de_perfil (medico_id, dia, total) VALUES (?::uuid, ?, 99)",
                ativos.get(0), LocalDate.now().minusDays(ProfissionaisEmDestaqueService.DIAS + 5));
        abrirPerfil(1, ativos.get(1));

        mvc.perform(get("/api/publico/destaques"))
                .andExpect(jsonPath("$[*].id", contains(ativos.get(1))));
    }
}
