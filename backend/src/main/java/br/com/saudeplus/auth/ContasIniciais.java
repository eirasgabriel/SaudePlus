package br.com.saudeplus.auth;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.core.annotation.Order;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import br.com.saudeplus.clinicas.UnidadeRepository;
import br.com.saudeplus.profissionais.EspecialidadeRepository;
import br.com.saudeplus.profissionais.Medico;
import br.com.saudeplus.profissionais.MedicoRepository;
import br.com.saudeplus.usuarios.Papel;
import br.com.saudeplus.usuarios.Usuario;
import br.com.saudeplus.usuarios.UsuarioRepository;

/**
 * Cria as contas de admin e médico na inicialização — não existe rota
 * pública que crie esses perfis. Só roda com `SEED_ENABLED=true`.
 *
 * Só cria quando o e-mail ainda não existe, para reiniciar o servidor não
 * sobrescrever uma senha já trocada. Sem `SEED_*_SENHA`, a conta nasce com a
 * senha padrão de teste (`saudeplus.seed.senha-padrao`), e o log avisa para
 * trocá-la; com a senha padrão também em branco, a conta é pulada.
 *
 * A conta de médico ganha também o perfil profissional (CRM, especialidade e,
 * se existir, a unidade). Uma conta de médico que já existia sem perfil é
 * completada.
 */
@Component
@ConditionalOnProperty(name = "saudeplus.seed.habilitado", havingValue = "true")
@Order(ContasIniciais.ORDEM)
class ContasIniciais implements ApplicationRunner {

    /** Roda antes dos dados de demonstração, que dependem destas contas. */
    static final int ORDEM = 1;

    private static final Logger log = LoggerFactory.getLogger(ContasIniciais.class);

    private final Propriedades propriedades;
    private final UsuarioRepository usuarios;
    private final MedicoRepository medicos;
    private final EspecialidadeRepository especialidades;
    private final UnidadeRepository unidades;
    private final PasswordEncoder codificador;
    private final String senhaPadrao;

    ContasIniciais(Propriedades propriedades, UsuarioRepository usuarios, MedicoRepository medicos,
            EspecialidadeRepository especialidades, UnidadeRepository unidades, PasswordEncoder codificador,
            @Value("${saudeplus.seed.senha-padrao:}") String senhaPadrao) {
        this.propriedades = propriedades;
        this.usuarios = usuarios;
        this.medicos = medicos;
        this.especialidades = especialidades;
        this.unidades = unidades;
        this.codificador = codificador;
        this.senhaPadrao = senhaPadrao;
    }

    @Override
    @Transactional
    public void run(ApplicationArguments argumentos) {
        garantirConta(propriedades.admin(), Papel.ADMIN);
        Usuario medico = garantirConta(propriedades.medico(), Papel.MEDICO);
        if (medico != null && medico.getPapel() == Papel.MEDICO) {
            garantirPerfilDeMedico(medico, propriedades.medico().perfil());
        }
    }

    /** Devolve a conta (criada agora ou já existente), ou `null` se não há configuração. */
    private Usuario garantirConta(Conta conta, Papel papel) {
        if (conta == null || vazio(conta.email())) {
            log.warn("Conta inicial {} sem e-mail configurado; nada foi criado.", papel);
            return null;
        }
        String email = Usuario.normalizarEmail(conta.email());
        var existente = usuarios.findByEmail(email);
        if (existente.isPresent()) {
            return existente.get();
        }
        boolean usaSenhaPadrao = vazio(conta.senha());
        String senha = usaSenhaPadrao ? senhaPadrao : conta.senha();
        if (vazio(senha)) {
            log.warn("Conta inicial {} sem senha configurada; nada foi criado.", papel);
            return null;
        }
        Usuario criada = usuarios.save(new Usuario(conta.nome(), email, codificador.encode(senha), null, papel));
        if (usaSenhaPadrao) {
            log.warn("Conta inicial {} criada: {} com a senha padrão de teste. Defina SEED_{}_SENHA ou troque a senha.",
                    papel, email, papel);
        } else {
            log.info("Conta inicial {} criada: {}", papel, email);
        }
        return criada;
    }

    private void garantirPerfilDeMedico(Usuario usuario, PerfilMedico perfil) {
        if (medicos.findByUsuarioId(usuario.getId()).isPresent()) {
            return;
        }
        if (perfil == null || vazio(perfil.crm()) || vazio(perfil.crmUf())) {
            log.warn("Conta inicial de médico sem CRM configurado; o perfil profissional não foi criado.");
            return;
        }
        Medico medico = new Medico(usuario, perfil.crm(), perfil.crmUf());
        if (medicos.existsByCrmAndCrmUf(medico.getCrm(), medico.getCrmUf())) {
            log.warn("CRM {}/{} já pertence a outro médico; o perfil profissional de {} não foi criado.",
                    medico.getCrm(), medico.getCrmUf(), usuario.getEmail());
            return;
        }
        if (!vazio(perfil.especialidade())) {
            especialidades.findBySlug(perfil.especialidade()).ifPresentOrElse(medico::adicionarEspecialidade,
                    () -> log.warn("Especialidade '{}' não existe; médico inicial ficou sem especialidade.",
                            perfil.especialidade()));
        }
        if (!vazio(perfil.unidade())) {
            unidades.findFirstByNome(perfil.unidade()).ifPresent(medico::adicionarUnidade);
        }
        medicos.save(medico);
        log.info("Perfil profissional criado para {}", usuario.getEmail());
    }

    private static boolean vazio(String valor) {
        return valor == null || valor.isBlank();
    }

    @ConfigurationProperties("saudeplus.contas-iniciais")
    record Propriedades(Conta admin, Conta medico) {
    }

    record Conta(String email, String senha, String nome, PerfilMedico perfil) {
    }

    /** `especialidade` é o slug; `unidade`, o nome exato de uma unidade (opcional). */
    record PerfilMedico(String crm, String crmUf, String especialidade, String unidade) {
    }
}
