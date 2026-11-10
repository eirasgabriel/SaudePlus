package br.com.saudeplus.areamedico;

import org.springframework.stereotype.Component;

import br.com.saudeplus.exception.AcessoProibidoException;
import br.com.saudeplus.profissionais.Medico;
import br.com.saudeplus.profissionais.MedicoRepository;
import br.com.saudeplus.security.UsuarioAutenticado;

/**
 * Resolve o perfil de médico de quem está logado. Toda rota `/api/medico/**`
 * parte daqui: o médico vem do token, nunca da URL.
 *
 * Deve ser chamado dentro da transação do service, para que as coleções do
 * médico (unidades, especialidades) possam ser lidas.
 */
@Component
class MedicoLogado {

    private final MedicoRepository medicos;

    MedicoLogado(MedicoRepository medicos) {
        this.medicos = medicos;
    }

    Medico de(UsuarioAutenticado usuario) {
        return medicos.findByUsuarioId(usuario.id())
                .orElseThrow(() -> new AcessoProibidoException(
                        "Seu perfil profissional ainda não foi configurado. Procure a administração."));
    }
}
