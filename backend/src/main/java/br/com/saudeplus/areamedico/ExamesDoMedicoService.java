package br.com.saudeplus.areamedico;

import java.time.Clock;
import java.time.LocalDate;
import java.util.EnumSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import br.com.saudeplus.areamedico.dto.ExamePendenteResposta;
import br.com.saudeplus.auditoria.Auditoria;
import br.com.saudeplus.areamedico.dto.RequisicoesDoMedico.SolicitarExame;
import br.com.saudeplus.areamedico.dto.RespostasDoMedico.ExameDetalhe;
import br.com.saudeplus.comum.Datas;
import br.com.saudeplus.comum.Pagina;
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

    static final int TAMANHO_MAXIMO = 100;

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

    /**
     * Todos os exames que o médico pediu, mais recentes primeiro. `status`
     * filtra por um status; "pendentes" junta os que ainda não têm resultado.
     */
    @Transactional(readOnly = true)
    public Pagina<ExamePendenteResposta> listar(UsuarioAutenticado usuario, String status, int pagina, int tamanho) {
        Medico medico = medicoLogado.de(usuario);
        Set<StatusExame> filtro = status == null || status.isBlank() ? EnumSet.allOf(StatusExame.class)
                : "pendentes".equalsIgnoreCase(status) ? StatusExame.pendentes()
                : EnumSet.of(StatusExame.porChave(status));
        Page<Exame> encontrados = exames.findByMedicoSolicitanteIdAndStatusIn(medico.getId(), filtro,
                PageRequest.of(Math.max(pagina, 0), Math.clamp(tamanho, 1, TAMANHO_MAXIMO),
                        Sort.by(Sort.Order.desc("criadoEm"), Sort.Order.desc("id"))));
        return Pagina.de(encontrados, this::resposta);
    }

    /** Detalhe de um exame que este médico pediu; de outro médico, 404. */
    @Transactional(readOnly = true)
    public ExameDetalhe detalhe(UsuarioAutenticado usuario, UUID exameId) {
        Medico medico = medicoLogado.de(usuario);
        return exames.findDetalheByIdAndMedicoSolicitanteId(exameId, medico.getId())
                .map(ExameDetalhe::de)
                .orElseThrow(() -> RecursoNaoEncontradoException.de("Exame", exameId.toString()));
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
