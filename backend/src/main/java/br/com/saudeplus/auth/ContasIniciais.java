package br.com.saudeplus.auth;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import br.com.saudeplus.usuarios.Papel;
import br.com.saudeplus.usuarios.Usuario;
import br.com.saudeplus.usuarios.UsuarioRepository;

/**
 * Cria as contas de admin e médico na inicialização — não existe rota
 * pública que crie esses perfis.
 *
 * Só cria quando o e-mail ainda não existe, para reiniciar o servidor não
 * sobrescrever uma senha já trocada. Conta sem senha configurada é pulada:
 * em produção, só nasce o que vier por variável de ambiente.
 *
 * O médico ganha só a conta de acesso por enquanto; o perfil com CRM,
 * especialidades e unidades entra junto com o catálogo de profissionais.
 */
@Component
class ContasIniciais implements ApplicationRunner {

    private static final Logger log = LoggerFactory.getLogger(ContasIniciais.class);

    private final Propriedades propriedades;
    private final UsuarioRepository usuarios;
    private final PasswordEncoder codificador;

    ContasIniciais(Propriedades propriedades, UsuarioRepository usuarios, PasswordEncoder codificador) {
        this.propriedades = propriedades;
        this.usuarios = usuarios;
        this.codificador = codificador;
    }

    @Override
    @Transactional
    public void run(ApplicationArguments argumentos) {
        garantir(propriedades.admin(), Papel.ADMIN);
        garantir(propriedades.medico(), Papel.MEDICO);
    }

    private void garantir(Conta conta, Papel papel) {
        if (conta == null || conta.email() == null || conta.email().isBlank()
                || conta.senha() == null || conta.senha().isBlank()) {
            log.warn("Conta inicial {} sem e-mail ou senha configurados; nada foi criado.", papel);
            return;
        }
        String email = Usuario.normalizarEmail(conta.email());
        if (usuarios.existsByEmail(email)) {
            return;
        }
        usuarios.save(new Usuario(conta.nome(), email, codificador.encode(conta.senha()), null, papel));
        log.info("Conta inicial {} criada: {}", papel, email);
    }

    @ConfigurationProperties("saudeplus.contas-iniciais")
    record Propriedades(Conta admin, Conta medico) {
    }

    record Conta(String email, String senha, String nome) {
    }
}
