package br.com.saudeplus.admin.dto;

import java.util.List;
import java.util.UUID;

import br.com.saudeplus.clinicas.StatusUnidade;
import br.com.saudeplus.clinicas.Unidade;
import br.com.saudeplus.exames.TipoExame;
import br.com.saudeplus.profissionais.Convenio;
import br.com.saudeplus.profissionais.Especialidade;

/** Respostas dos cadastros da administração: unidades e catálogos. */
public final class CadastrosAdminResposta {

    private CadastrosAdminResposta() {
    }

    /**
     * Unidade na visão da administração, com todos os status.
     *
     * @param especialidades especialidades dos médicos vinculados
     * @param agendamentosNoMes consultas do mês corrente na unidade
     */
    public record UnidadeAdmin(UUID id, String nome, String endereco, String bairro, String cidade, String uf,
            String telefone, String horarioFuncionamento, String mapUrl, StatusUnidade status,
            List<String> especialidades, long medicos, long agendamentosNoMes) {

        public static UnidadeAdmin de(Unidade unidade, List<String> especialidades, long medicos, long agendamentosNoMes) {
            return new UnidadeAdmin(unidade.getId(), unidade.getNome(), unidade.getEndereco(), unidade.getBairro(),
                    unidade.getCidade(), unidade.getUf(), unidade.getTelefone(), unidade.getHorarioFuncionamento(),
                    unidade.getMapUrl(), unidade.getStatus(), especialidades, medicos, agendamentosNoMes);
        }
    }

    public record MetricasDeUnidades(long total, long ativas, long manutencao, long inativas) {
    }

    public record EspecialidadeAdmin(UUID id, String slug, String nome, String descricao) {

        public static EspecialidadeAdmin de(Especialidade e) {
            return new EspecialidadeAdmin(e.getId(), e.getSlug(), e.getNome(), e.getDescricao());
        }
    }

    public record ConvenioAdmin(UUID id, String nome, boolean ativo) {

        public static ConvenioAdmin de(Convenio c) {
            return new ConvenioAdmin(c.getId(), c.getNome(), c.isAtivo());
        }
    }

    public record TipoExameAdmin(UUID id, String nome, String categoria, String preparo, Short prazoResultadoDias) {

        public static TipoExameAdmin de(TipoExame t) {
            return new TipoExameAdmin(t.getId(), t.getNome(), t.getCategoria(), t.getPreparo(), t.getPrazoResultadoDias());
        }
    }
}
