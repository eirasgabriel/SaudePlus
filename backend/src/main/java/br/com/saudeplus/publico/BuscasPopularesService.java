package br.com.saudeplus.publico;

import java.sql.Date;
import java.time.Clock;
import java.time.LocalDate;
import java.util.Collection;
import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.dao.DataAccessException;
import org.springframework.jdbc.core.namedparam.MapSqlParameterSource;
import org.springframework.jdbc.core.namedparam.NamedParameterJdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import br.com.saudeplus.publico.dto.BuscaPopularResposta;

/**
 * Conta as buscas públicas por especialidade e devolve as mais buscadas.
 *
 * Só o filtro de especialidade entra na conta (slugs do catálogo); o termo
 * livre nunca é guardado, porque pode trazer nome, CPF ou sintoma de alguém.
 * Os contadores são diários e anônimos: não dá para saber quem buscou.
 */
@Service
public class BuscasPopularesService {

    /** Janela das "buscas populares". */
    static final int DIAS = 30;
    /** Basta ter sido buscada na janela; o corte é o ranking (top {@value #LIMITE_MAXIMO}). */
    static final int MINIMO_DE_BUSCAS = 1;
    /** Busca com muitas especialidades marcadas diz pouco sobre cada uma; não conta. */
    static final int MAXIMO_DE_ESPECIALIDADES = 3;
    static final int LIMITE_MAXIMO = 10;

    private static final Logger LOG = LoggerFactory.getLogger(BuscasPopularesService.class);

    private final NamedParameterJdbcTemplate jdbc;
    private final Clock relogio;

    public BuscasPopularesService(NamedParameterJdbcTemplate jdbc, Clock relogio) {
        this.jdbc = jdbc;
        this.relogio = relogio;
    }

    /**
     * Soma uma busca a cada especialidade do filtro. Slugs fora do catálogo são
     * ignorados. Falhar aqui não pode derrubar a busca: o erro só vai para o log.
     */
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void registrar(Collection<String> slugs) {
        if (slugs == null) {
            return;
        }
        List<String> distintos = slugs.stream().filter(s -> s != null && !s.isBlank()).distinct().toList();
        if (distintos.isEmpty() || distintos.size() > MAXIMO_DE_ESPECIALIDADES) {
            return;
        }
        try {
            jdbc.update("""
                    INSERT INTO buscas_por_especialidade (especialidade_id, dia, total)
                    SELECT e.id, :dia, 1 FROM especialidades e WHERE e.slug IN (:slugs)
                    ON CONFLICT (especialidade_id, dia)
                    DO UPDATE SET total = buscas_por_especialidade.total + 1
                    """, new MapSqlParameterSource()
                    .addValue("dia", Date.valueOf(LocalDate.now(relogio)))
                    .addValue("slugs", distintos));
        } catch (DataAccessException erro) {
            LOG.warn("Não foi possível registrar a busca por especialidade", erro);
        }
    }

    /** Especialidades mais buscadas nos últimos {@value #DIAS} dias, da mais para a menos buscada. */
    @Transactional(readOnly = true)
    public List<BuscaPopularResposta> maisBuscadas(int limite) {
        LocalDate hoje = LocalDate.now(relogio);
        return jdbc.query("""
                SELECT e.slug, e.nome
                FROM buscas_por_especialidade b
                JOIN especialidades e ON e.id = b.especialidade_id
                WHERE b.dia > :inicio AND b.dia <= :hoje
                GROUP BY e.id, e.slug, e.nome
                HAVING SUM(b.total) >= :minimo
                ORDER BY SUM(b.total) DESC, e.nome
                LIMIT :limite
                """, new MapSqlParameterSource()
                .addValue("inicio", Date.valueOf(hoje.minusDays(DIAS)))
                .addValue("hoje", Date.valueOf(hoje))
                .addValue("minimo", MINIMO_DE_BUSCAS)
                .addValue("limite", Math.clamp(limite, 1, LIMITE_MAXIMO)),
                (linha, i) -> new BuscaPopularResposta(linha.getString("slug"), linha.getString("nome")));
    }
}
