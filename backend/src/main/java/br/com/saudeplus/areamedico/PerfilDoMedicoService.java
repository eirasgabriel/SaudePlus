package br.com.saudeplus.areamedico;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import br.com.saudeplus.areamedico.dto.RequisicoesDoMedico.AtualizarPerfilProfissional;
import br.com.saudeplus.areamedico.dto.RespostasDoMedico.PerfilProfissional;
import br.com.saudeplus.areamedico.dto.RespostasDoMedico.UnidadeDoMedico;
import br.com.saudeplus.auditoria.Auditoria;
import br.com.saudeplus.profissionais.Medico;
import br.com.saudeplus.security.UsuarioAutenticado;

/**
 * "Meu perfil" e "Unidade" do médico. O próprio médico muda só a
 * apresentação e o valor da consulta; CRM, especialidades e unidades são
 * decisão da administração (`/api/admin/usuarios/{id}`).
 */
@Service
public class PerfilDoMedicoService {

    private final MedicoLogado medicoLogado;
    private final Auditoria auditoria;

    public PerfilDoMedicoService(MedicoLogado medicoLogado, Auditoria auditoria) {
        this.medicoLogado = medicoLogado;
        this.auditoria = auditoria;
    }

    @Transactional(readOnly = true)
    public PerfilProfissional perfil(UsuarioAutenticado usuario) {
        return PerfilProfissional.de(medicoLogado.de(usuario));
    }

    @Transactional
    public PerfilProfissional atualizar(UsuarioAutenticado usuario, AtualizarPerfilProfissional requisicao) {
        Medico medico = medicoLogado.de(usuario);
        medico.alterarPerfil(medico.getCrm(), medico.getCrmUf(), requisicao.bio(), requisicao.valorConsulta());
        Map<String, Object> detalhe = new HashMap<>();
        detalhe.put("valorConsulta", requisicao.valorConsulta());
        auditoria.registrar("medico.perfil", "medico", medico.getId(), detalhe);
        return PerfilProfissional.de(medico);
    }

    /** Todas as unidades vinculadas, em ordem de nome; as fora de funcionamento vêm com o status. */
    @Transactional(readOnly = true)
    public List<UnidadeDoMedico> unidades(UsuarioAutenticado usuario) {
        return medicoLogado.de(usuario).unidadesVinculadas().stream().map(UnidadeDoMedico::de).toList();
    }
}
