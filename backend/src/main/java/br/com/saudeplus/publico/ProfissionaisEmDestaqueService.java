package br.com.saudeplus.publico;

import java.sql.Date;
import java.time.Clock;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.dao.DataAccessException;
import org.springframework.jdbc.core.namedparam.MapSqlParameterSource;
import org.springframework.jdbc.core.namedparam.NamedParameterJdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import br.com.saudeplus.publico.dto.ProfissionalResumoResposta;

/**
 * "Profissionais em destaque": os médicos cujo perfil público foi mais aberto
 * nos últimos {@value #DIAS} dias. Mesma ideia das buscas populares: contador
 * diário e anônimo por médico, sem saber quem visitou.
 */
@Service
public class ProfissionaisEmDestaqueService {

    static final int DIAS = 30;
    static final int LIMITE_MAXIMO = 12;

    private static final Logger LOG = LoggerFactory.getLogger(ProfissionaisEmDestaqueService.class);

    private final NamedParameterJdbcTemplate jdbc;
    private final ProfissionaisPublicoService profissionais;
    private final Clock relogio;

    public ProfissionaisEmDestaqueService(NamedParameterJdbcTemplate jdbc, ProfissionaisPublicoService profissionais,
            Clock relogio) {
        this.jdbc = jdbc;
        this.profissionais = profissionais;
        this.relogio = relogio;
    }

    /** Soma uma abertura ao perfil do médico. Falhar aqui não derruba o perfil: vai só para o log. */
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void registrarVisualizacao(UUID medicoId) {
        try {
            jdbc.update("""
                    INSERT INTO visualizacoes_de_perfil (medico_id, dia, total)
                    VALUES (:medico, :dia, 1)
                    ON CONFLICT (medico_id, dia)
                    DO UPDATE SET total = visualizacoes_de_perfil.total + 1
                    """, new MapSqlParameterSource()
                    .addValue("medico", medicoId)
                    .addValue("dia", Date.valueOf(LocalDate.now(relogio))));
        } catch (DataAccessException erro) {
            LOG.warn("Não foi possível registrar a visualização do perfil", erro);
        }
    }

    /**
     * Cartões dos médicos ativos cujo perfil foi aberto na janela, do mais para
     * o menos visto (empate: melhor avaliado). Só entra quem tem visita: sem
     * visitas, a lista vem vazia e a página mostra os cartões em branco.
     */
    @Transactional(readOnly = true)
    public List<ProfissionalResumoResposta> destaques(int limite) {
        LocalDate hoje = LocalDate.now(relogio);
        List<UUID> ids = jdbc.queryForList("""
                SELECT m.id
                FROM visualizacoes_de_perfil v
                JOIN medicos m ON m.id = v.medico_id
                JOIN usuarios u ON u.id = m.usuario_id
                WHERE v.dia > :inicio AND v.dia <= :hoje AND u.status = 'ativo'
                GROUP BY m.id, m.nota_media, m.total_avaliacoes
                ORDER BY SUM(v.total) DESC, m.nota_media DESC, m.total_avaliacoes DESC, m.id
                LIMIT :limite
                """, new MapSqlParameterSource()
                .addValue("inicio", Date.valueOf(hoje.minusDays(DIAS)))
                .addValue("hoje", Date.valueOf(hoje))
                .addValue("limite", Math.clamp(limite, 1, LIMITE_MAXIMO)), UUID.class);
        return profissionais.resumos(ids);
    }
}
