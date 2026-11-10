package br.com.saudeplus.areapaciente;

import java.util.List;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import br.com.saudeplus.areapaciente.dto.RespostasDoPaciente;
import br.com.saudeplus.exames.Exame;
import br.com.saudeplus.exames.ExameRepository;
import br.com.saudeplus.exames.ExamesService;
import br.com.saudeplus.exames.ExamesService.ArquivoDoResultado;
import br.com.saudeplus.exames.StatusExame;
import br.com.saudeplus.exception.RecursoNaoEncontradoException;
import br.com.saudeplus.pacientes.Paciente;
import br.com.saudeplus.security.UsuarioAutenticado;

/** Exames do paciente, com o preparo de cada um e o resultado para baixar quando liberado. */
@Service
public class ExamesDoPacienteService {

    private final PacienteLogado pacienteLogado;
    private final ExameRepository exames;
    private final ExamesService servico;

    public ExamesDoPacienteService(PacienteLogado pacienteLogado, ExameRepository exames, ExamesService servico) {
        this.pacienteLogado = pacienteLogado;
        this.exames = exames;
        this.servico = servico;
    }

    /** Arquivo do resultado; exame de outra pessoa ou ainda sem resultado, 404. */
    @Transactional(readOnly = true)
    public ArquivoDoResultado resultado(UsuarioAutenticado usuario, UUID exameId) {
        Paciente paciente = pacienteLogado.de(usuario);
        Exame exame = exames.findByIdAndPacienteId(exameId, paciente.getId())
                .orElseThrow(() -> RecursoNaoEncontradoException.de("Exame", exameId.toString()));
        return servico.arquivo(exame);
    }

    @Transactional(readOnly = true)
    public List<RespostasDoPaciente.Exame> listar(UsuarioAutenticado usuario, StatusExame status) {
        Paciente paciente = pacienteLogado.de(usuario);
        return exames.findByPacienteIdOrderByCriadoEmDesc(paciente.getId()).stream()
                .filter(exame -> status == null || exame.getStatus() == status)
                .map(ExamesDoPacienteService::resposta)
                .toList();
    }

    @Transactional(readOnly = true)
    public RespostasDoPaciente.Exame detalhe(UsuarioAutenticado usuario, UUID exameId) {
        Paciente paciente = pacienteLogado.de(usuario);
        return exames.findByIdAndPacienteId(exameId, paciente.getId())
                .map(ExamesDoPacienteService::resposta)
                .orElseThrow(() -> RecursoNaoEncontradoException.de("Exame", exameId.toString()));
    }

    private static RespostasDoPaciente.Exame resposta(Exame exame) {
        return new RespostasDoPaciente.Exame(
                exame.getId(),
                exame.getTipo().getNome(),
                exame.getTipo().getCategoria(),
                exame.getTipo().getPreparo(),
                exame.getStatus(),
                exame.getDataHora(),
                exame.getPrazo(),
                exame.getMedicoSolicitante() == null ? null : exame.getMedicoSolicitante().getUsuario().getNomeCompleto(),
                exame.getUnidade() == null ? null : exame.getUnidade().getNome(),
                exame.getStatus() == StatusExame.LIBERADO);
    }
}
