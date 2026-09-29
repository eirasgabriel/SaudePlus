package br.com.saudeplus.profissionais;

import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.UUID;

import org.springframework.data.jpa.domain.Specification;

import br.com.saudeplus.agenda.Disponibilidade;
import br.com.saudeplus.agenda.Modalidade;
import br.com.saudeplus.clinicas.StatusUnidade;
import br.com.saudeplus.clinicas.Unidade;
import br.com.saudeplus.usuarios.StatusConta;
import br.com.saudeplus.usuarios.Usuario;
import jakarta.persistence.criteria.CriteriaBuilder;
import jakarta.persistence.criteria.CriteriaQuery;
import jakarta.persistence.criteria.Join;
import jakarta.persistence.criteria.Predicate;
import jakarta.persistence.criteria.Root;
import jakarta.persistence.criteria.Subquery;

/**
 * Filtros da busca pública. Campo nulo ou lista vazia não filtra.
 *
 * Dentro de cada lista vale "qualquer um" (especialidade A ou B); entre
 * filtros diferentes vale "todos" (especialidade A e convênio X).
 *
 * @param termo trecho do nome do médico ou de uma especialidade dele
 * @param especialidades slugs, como `cardiologia`
 * @param cidade nome da cidade de alguma unidade em funcionamento do médico
 * @param uf sigla do estado dessa mesma unidade
 * @param convenios nomes exatos, como `Unimed`
 */
public record FiltroDeProfissionais(
        String termo,
        List<String> especialidades,
        String cidade,
        String uf,
        List<Modalidade> modalidades,
        List<String> convenios) {

    public FiltroDeProfissionais {
        termo = termo == null || termo.isBlank() ? null : termo.strip().toLowerCase(Locale.ROOT);
        cidade = cidade == null || cidade.isBlank() ? null : cidade.strip();
        uf = uf == null || uf.isBlank() ? null : uf.strip();
        especialidades = especialidades == null ? List.of() : especialidades;
        modalidades = modalidades == null ? List.of() : modalidades;
        convenios = convenios == null ? List.of() : convenios;
    }

    /**
     * Cada filtro de coleção vira um `exists`, não um join: assim um médico com
     * duas especialidades não aparece duas vezes, e a ordenação pelo nome não
     * esbarra na regra do Postgres para `select distinct ... order by`.
     */
    public Specification<Medico> comoEspecificacao() {
        return (medico, consulta, cb) -> {
            Join<Medico, Usuario> usuario = medico.join("usuario");
            List<Predicate> regras = new ArrayList<>();
            regras.add(cb.equal(usuario.get("status"), StatusConta.ATIVO));
            // Só aparece quem tem onde atender (e, com cidade, onde atender nela).
            regras.add(cb.exists(unidadeAtiva(medico, consulta, cb)));

            if (termo != null) {
                String padrao = "%" + termo.replace("\\", "\\\\").replace("%", "\\%").replace("_", "\\_") + "%";
                regras.add(cb.or(
                        cb.like(cb.lower(usuario.get("nomeCompleto")), padrao, '\\'),
                        cb.exists(especialidadeComNome(medico, consulta, cb, padrao))));
            }
            if (!especialidades.isEmpty()) {
                regras.add(cb.exists(especialidadeComSlug(medico, consulta, cb)));
            }
            if (!modalidades.isEmpty()) {
                regras.add(cb.exists(atendeNaModalidade(medico, consulta, cb)));
            }
            if (!convenios.isEmpty()) {
                regras.add(cb.exists(aceitaConvenio(medico, consulta, cb)));
            }
            return cb.and(regras.toArray(Predicate[]::new));
        };
    }

    private Subquery<UUID> unidadeAtiva(Root<Medico> medico, CriteriaQuery<?> consulta, CriteriaBuilder cb) {
        Subquery<UUID> sub = consulta.subquery(UUID.class);
        Root<Medico> mesmo = sub.correlate(medico);
        Join<Medico, Unidade> unidade = mesmo.join("unidades");
        List<Predicate> regras = new ArrayList<>();
        regras.add(cb.equal(unidade.get("status"), StatusUnidade.ATIVA));
        if (cidade != null) {
            regras.add(cb.equal(cb.lower(unidade.get("cidade")), cidade.toLowerCase(Locale.ROOT)));
        }
        if (uf != null) {
            regras.add(cb.equal(cb.upper(unidade.get("uf")), uf.toUpperCase(Locale.ROOT)));
        }
        return sub.select(unidade.get("id")).where(regras.toArray(Predicate[]::new));
    }

    private Subquery<UUID> especialidadeComNome(Root<Medico> medico, CriteriaQuery<?> consulta, CriteriaBuilder cb,
            String padrao) {
        Subquery<UUID> sub = consulta.subquery(UUID.class);
        Join<Medico, Especialidade> especialidade = sub.correlate(medico).join("especialidades");
        return sub.select(especialidade.get("id"))
                .where(cb.like(cb.lower(especialidade.get("nome")), padrao, '\\'));
    }

    private Subquery<UUID> especialidadeComSlug(Root<Medico> medico, CriteriaQuery<?> consulta, CriteriaBuilder cb) {
        Subquery<UUID> sub = consulta.subquery(UUID.class);
        Join<Medico, Especialidade> especialidade = sub.correlate(medico).join("especialidades");
        return sub.select(especialidade.get("id")).where(especialidade.get("slug").in(especialidades));
    }

    private Subquery<UUID> aceitaConvenio(Root<Medico> medico, CriteriaQuery<?> consulta, CriteriaBuilder cb) {
        Subquery<UUID> sub = consulta.subquery(UUID.class);
        Join<Medico, Convenio> convenio = sub.correlate(medico).join("convenios");
        return sub.select(convenio.get("id"))
                .where(cb.isTrue(convenio.get("ativo")), convenio.get("nome").in(convenios));
    }

    private Subquery<UUID> atendeNaModalidade(Root<Medico> medico, CriteriaQuery<?> consulta, CriteriaBuilder cb) {
        Subquery<UUID> sub = consulta.subquery(UUID.class);
        Root<Disponibilidade> disponibilidade = sub.from(Disponibilidade.class);
        return sub.select(disponibilidade.get("id")).where(
                cb.equal(disponibilidade.get("medico"), medico),
                disponibilidade.get("modalidade").in(modalidades));
    }
}
