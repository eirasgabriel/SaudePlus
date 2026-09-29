package br.com.saudeplus.auditoria;

import java.time.Clock;
import java.time.Instant;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.function.Function;
import java.util.stream.Collectors;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import br.com.saudeplus.comum.Pagina;
import br.com.saudeplus.usuarios.Usuario;
import br.com.saudeplus.usuarios.UsuarioRepository;
import jakarta.persistence.criteria.Predicate;
import tools.jackson.databind.JsonNode;
import tools.jackson.databind.json.JsonMapper;

/** Consulta do registro de atividades (só ADMIN), mais recentes primeiro. */
@Service
public class AuditoriaService {

    static final int TAMANHO_MAXIMO = 200;

    private final RegistroAtividadeRepository registros;
    private final UsuarioRepository usuarios;
    private final JsonMapper json;
    private final Clock relogio;

    public AuditoriaService(RegistroAtividadeRepository registros, UsuarioRepository usuarios, JsonMapper json,
            Clock relogio) {
        this.registros = registros;
        this.usuarios = usuarios;
        this.json = json;
        this.relogio = relogio;
    }

    public record Autor(UUID id, String nome, String email) {
    }

    public record Registro(UUID id, Instant quando, Autor usuario, String acao, String entidade, UUID entidadeId,
            JsonNode detalhe, String ip) {
    }

    /** `acao` aceita prefixo: "usuario" traz usuario.criar, usuario.status... */
    @Transactional(readOnly = true)
    public Pagina<Registro> listar(UUID usuarioId, String acao, LocalDate de, LocalDate ate, int pagina, int tamanho) {
        Specification<RegistroAtividade> filtro = (r, consulta, cb) -> {
            List<Predicate> regras = new ArrayList<>();
            if (usuarioId != null) {
                regras.add(cb.equal(r.get("usuarioId"), usuarioId));
            }
            if (acao != null && !acao.isBlank()) {
                regras.add(cb.like(r.get("acao"), acao.strip().replace("%", "") + "%"));
            }
            if (de != null) {
                regras.add(cb.greaterThanOrEqualTo(r.get("criadoEm"), de.atStartOfDay(relogio.getZone()).toInstant()));
            }
            if (ate != null) {
                regras.add(cb.lessThan(r.get("criadoEm"), ate.plusDays(1).atStartOfDay(relogio.getZone()).toInstant()));
            }
            return cb.and(regras.toArray(Predicate[]::new));
        };
        Page<RegistroAtividade> encontrados = registros.findAll(filtro, PageRequest.of(Math.max(pagina, 0),
                Math.clamp(tamanho, 1, TAMANHO_MAXIMO), Sort.by(Sort.Order.desc("criadoEm"), Sort.Order.desc("id"))));
        Map<UUID, Usuario> autores = usuarios.findAllById(encontrados.getContent().stream()
                        .map(RegistroAtividade::getUsuarioId).filter(id -> id != null).distinct().toList()).stream()
                .collect(Collectors.toMap(Usuario::getId, Function.identity()));
        return Pagina.de(encontrados, r -> new Registro(
                r.getId(),
                r.getCriadoEm(),
                autores.containsKey(r.getUsuarioId())
                        ? new Autor(r.getUsuarioId(), autores.get(r.getUsuarioId()).getNomeCompleto(),
                                autores.get(r.getUsuarioId()).getEmail())
                        : null,
                r.getAcao(),
                r.getEntidade(),
                r.getEntidadeId(),
                r.getDetalhe() == null ? null : json.readTree(r.getDetalhe()),
                r.getIp()));
    }
}
