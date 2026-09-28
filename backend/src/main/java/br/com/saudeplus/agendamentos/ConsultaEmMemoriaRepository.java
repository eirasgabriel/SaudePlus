package br.com.saudeplus.agendamentos;

import java.time.LocalDate;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.concurrent.ConcurrentHashMap;
import java.util.function.Function;

import org.springframework.stereotype.Repository;

import br.com.saudeplus.dados.DadosDemonstracao;

/**
 * Guarda as consultas num mapa concorrente porque esta é a única entidade
 * que a API altera (troca de status). As demais são somente leitura.
 *
 * Sem banco, as alterações vivem enquanto a aplicação estiver de pé e
 * voltam ao estado inicial a cada reinício.
 */
@Repository
public class ConsultaEmMemoriaRepository implements ConsultaRepository {

    private final Map<String, Consulta> consultas = new ConcurrentHashMap<>(
            DadosDemonstracao.consultas().stream()
                    .collect(java.util.stream.Collectors.toMap(Consulta::id, Function.identity())));

    @Override
    public List<Consulta> porMedicoEData(String medicoId, LocalDate data) {
        return consultas.values().stream()
                .filter(consulta -> consulta.medicoId().equals(medicoId))
                .filter(consulta -> consulta.data().equals(data))
                .sorted(Comparator.comparing(Consulta::horario))
                .toList();
    }

    @Override
    public Optional<Consulta> porId(String id) {
        return Optional.ofNullable(consultas.get(id));
    }

    @Override
    public Consulta salvar(Consulta consulta) {
        consultas.put(consulta.id(), consulta);
        return consulta;
    }
}
