package br.com.saudeplus.areapaciente;

import java.time.Clock;
import java.time.LocalDate;
import java.util.Map;

import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import br.com.saudeplus.areapaciente.dto.RequisicoesDoPaciente.AtualizarPerfil;
import br.com.saudeplus.areapaciente.dto.RespostasDoPaciente.ConvenioDoPaciente;
import br.com.saudeplus.areapaciente.dto.RespostasDoPaciente.Perfil;
import br.com.saudeplus.auditoria.Auditoria;
import br.com.saudeplus.comum.Cpf;
import br.com.saudeplus.exception.ConflitoException;
import br.com.saudeplus.exception.RegraDeNegocioException;
import br.com.saudeplus.exception.RequisicaoInvalidaException;
import br.com.saudeplus.pacientes.Paciente;
import br.com.saudeplus.profissionais.Convenio;
import br.com.saudeplus.profissionais.ConvenioRepository;
import br.com.saudeplus.security.UsuarioAutenticado;
import br.com.saudeplus.usuarios.Usuario;
import br.com.saudeplus.usuarios.UsuarioRepository;

/**
 * "Minhas informações" do paciente: dados da conta e do cadastro clínico
 * básico. Regras:
 * - o CPF pode ser informado uma vez; trocar um CPF já gravado é com a
 *   administração, porque ele identifica a pessoa nos atendimentos;
 * - CPF de outra conta dá 409;
 * - só convênio ativo é aceito; sem convênio, a carteirinha é apagada.
 */
@Service
public class PerfilDoPacienteService {

    private final PacienteLogado pacienteLogado;
    private final UsuarioRepository usuarios;
    private final ConvenioRepository convenios;
    private final Auditoria auditoria;
    private final Clock relogio;

    public PerfilDoPacienteService(PacienteLogado pacienteLogado, UsuarioRepository usuarios,
            ConvenioRepository convenios, Auditoria auditoria, Clock relogio) {
        this.pacienteLogado = pacienteLogado;
        this.usuarios = usuarios;
        this.convenios = convenios;
        this.auditoria = auditoria;
        this.relogio = relogio;
    }

    @Transactional(readOnly = true)
    public Perfil perfil(UsuarioAutenticado usuario) {
        return resposta(pacienteLogado.de(usuario));
    }

    @Transactional
    public Perfil atualizar(UsuarioAutenticado autenticado, AtualizarPerfil requisicao) {
        Paciente paciente = pacienteLogado.de(autenticado);
        Usuario usuario = paciente.getUsuario();
        String cpf = cpfFinal(usuario, requisicao.cpf());
        if (requisicao.convenioId() != null && convenios.findById(requisicao.convenioId()).filter(Convenio::isAtivo).isEmpty()) {
            throw RequisicaoInvalidaException.noCampo("convenioId", "Escolha um convênio ativo.");
        }

        usuario.alterarCadastro(requisicao.nomeCompleto(), requisicao.telefone(), cpf);
        paciente.informarNascimento(requisicao.dataNascimento());
        paciente.informarSexo(requisicao.sexo());
        paciente.informarConvenio(requisicao.convenioId(), requisicao.numeroCarteirinha());
        try {
            // Dois cadastros com o mesmo CPF ao mesmo tempo: o índice único decide.
            usuarios.saveAndFlush(usuario);
        } catch (DataIntegrityViolationException excecao) {
            throw new ConflitoException("Este CPF já está em outra conta.");
        }
        // Só o fato, não os valores: são dados pessoais (LGPD).
        auditoria.registrar(usuario.getId(), "paciente.perfil", "paciente", paciente.getId(),
                Map.of("comConvenio", requisicao.convenioId() != null));
        return resposta(paciente);
    }

    /** CPF vazio mantém o que já existe; um diferente do gravado é recusado. */
    private String cpfFinal(Usuario usuario, String informado) {
        String cpf;
        try {
            cpf = Cpf.normalizar(informado);
        } catch (IllegalArgumentException excecao) {
            throw RequisicaoInvalidaException.noCampo("cpf", "CPF inválido.");
        }
        if (usuario.getCpf() != null) {
            if (cpf != null && !cpf.equals(usuario.getCpf())) {
                throw new RegraDeNegocioException("O CPF já informado só pode ser corrigido pela clínica.");
            }
            return usuario.getCpf();
        }
        if (cpf != null && usuarios.existsByCpfAndIdNot(cpf, usuario.getId())) {
            throw new ConflitoException("Este CPF já está em outra conta.");
        }
        return cpf;
    }

    private Perfil resposta(Paciente paciente) {
        Usuario usuario = paciente.getUsuario();
        ConvenioDoPaciente convenio = paciente.getConvenioId() == null ? null
                : convenios.findById(paciente.getConvenioId()).map(c -> new ConvenioDoPaciente(c.getId(), c.getNome()))
                        .orElse(null);
        return new Perfil(paciente.getId(), usuario.getNomeCompleto(), usuario.getEmail(), usuario.getTelefone(),
                usuario.getFotoUrl(), usuario.getCpf(), paciente.getDataNascimento(),
                paciente.idadeEm(LocalDate.now(relogio)), paciente.getSexo(), convenio, paciente.getNumeroCarteirinha());
    }
}
