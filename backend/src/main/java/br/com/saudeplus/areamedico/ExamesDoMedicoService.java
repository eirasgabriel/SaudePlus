package br.com.saudeplus.areamedico;

import java.time.Clock;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import br.com.saudeplus.areamedico.dto.ExamePendenteResposta;
import br.com.saudeplus.auditoria.Auditoria;
import br.com.saudeplus.areamedico.dto.RequisicoesDoMedico.SolicitarExame;
import br.com.saudeplus.comum.Datas;
import br.com.saudeplus.exames.Exame;
import br.com.saudeplus.exames.ExameRepository;
import br.com.saudeplus.exames.ExamesService;
import br.com.saudeplus.exames.ExamesService.ArquivoDoResultado;
import br.com.saudeplus.exames.StatusExame;
import br.com.saudeplus.exception.RecursoNaoEncontradoException;
import br.com.saudeplus.profissionais.Medico;
import br.com.saudeplus.security.UsuarioAutenticado;

/** Exames do ponto de vista do médico: os que pediu, pedir novos e ver resultados. */
@Service
public class ExamesDoMedicoService {

    private final MedicoLogado medicoLogado;
    private final ExameRepository exames;
    private final ExamesService servico;
    private final Auditoria auditoria;
    private final Clock relogio;

    public ExamesDoMedicoService(MedicoLogado medicoLogado, ExameRepository exames, ExamesService servico,
            Auditoria auditoria, Clock relogio) {
        this.medicoLogado = medicoLogado;
        this.exames = exames;
        this.servico = servico;
        this.auditoria = auditoria;
        this.relogio = relogio;
    }

    @Transactional(readOnly = true)
    public List<ExamePendenteResposta> pendentes(UsuarioAutenticado usuario) {
        return pendentes(medicoLogado.de(usuario));
    }

    List<ExamePendenteResposta> pendentes(Medico medico) {
        return exames.pendentesDoMedico(medico.getId(), StatusExame.pendentes()).stream().map(this::resposta).toList();
    }

    @Transactional
    public ExamePendenteResposta solicitar(UsuarioAutenticado usuario, SolicitarExame requisicao) {
        Medico medico = medicoLogado.de(usuario);
        Exame exame = servico.solicitar(medico, requisicao.pacienteId(), requisicao.tipoExameId(), requisicao.prazo(),
                requisicao.agendamentoOrigemId());
        return resposta(exames.findCompletoById(exame.getId()).orElse(exame));
    }

    /**
     * Resultado de um exame que este médico pediu; de outro médico, 404. A
     * leitura fica na auditoria: é dado de saúde de outra pessoa (LGPD, art. 37).
     * Não é `readOnly` porque grava esse registro.
     */
    @Transactional
    public ArquivoDoResultado resultado(UsuarioAutenticado usuario, UUID exameId) {
        Medico medico = medicoLogado.de(usuario);
        Exame exame = exames.findByIdAndMedicoSolicitanteId(exameId, medico.getId())
                .orElseThrow(() -> RecursoNaoEncontradoException.de("Exame", exameId.toString()));
        ArquivoDoResultado arquivo = servico.arquivo(exame);
        auditoria.registrar("exame.resultado.ver", "exame", exame.getId(),
                Map.of("pacienteId", exame.getPaciente().getId()));
        return arquivo;
    }

    private ExamePendenteResposta resposta(Exame exame) {
        return new ExamePendenteResposta(
                exame.getId(),
                exame.getTipo().getNome(),
                exame.getPaciente().getId(),
                exame.getPaciente().getUsuario().getNomeCompleto(),
                Datas.prazoPorExtenso(exame.getPrazo(), LocalDate.now(relogio)),
                exame.getPrazo(),
                exame.getStatus());
    }
}
