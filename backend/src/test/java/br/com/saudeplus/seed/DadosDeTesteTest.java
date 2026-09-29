package br.com.saudeplus.seed;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.util.stream.IntStream;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.ApplicationRunner;
import org.springframework.context.ApplicationContext;
import org.springframework.security.crypto.password.PasswordEncoder;

import br.com.saudeplus.TesteDeIntegracao;
import br.com.saudeplus.pacientes.PacienteRepository;
import br.com.saudeplus.profissionais.MedicoRepository;
import br.com.saudeplus.usuarios.Usuario;
import br.com.saudeplus.usuarios.UsuarioRepository;

/** O perfil test liga o seed: ele já rodou na subida, e rodar de novo não pode duplicar nada. */
@TesteDeIntegracao
class DadosDeTesteTest {

    @Autowired
    private ApplicationContext contexto;

    @Autowired
    private DadosDeTeste dadosDeTeste;

    @Autowired
    private UsuarioRepository usuarios;

    @Autowired
    private MedicoRepository medicos;

    @Autowired
    private PacienteRepository pacientes;

    @Autowired
    private PasswordEncoder codificador;

    @Test
    @DisplayName("cria médicos e pacientes de teste com senha padrão em hash")
    void cria() {
        assertTrue(usuarios.existsByEmail("paciente@teste.com"));
        assertTrue(usuarios.existsByEmail("medico2@exemplo.com"));
        assertTrue(usuarios.existsByEmail("medico3@exemplo.com"));
        IntStream.rangeClosed(2, 10).forEach(n -> assertTrue(usuarios.existsByEmail("paciente" + n + "@exemplo.com")));

        Usuario paciente = usuarios.findByEmail("paciente3@exemplo.com").orElseThrow();
        assertTrue(codificador.matches("teste@saudeplus", paciente.getSenhaHash()));
        assertNotNull(pacientes.findByUsuarioId(paciente.getId()).orElseThrow().getDataNascimento());
    }

    @Test
    @DisplayName("rodar o seed de novo não duplica nem altera registros")
    void idempotente() throws Exception {
        ApplicationRunner contasIniciais = contexto.getBean("contasIniciais", ApplicationRunner.class);
        String hashAntes = usuarios.findByEmail("admin@saudeplus.com").map(Usuario::getSenhaHash).orElseThrow();
        long usuariosAntes = usuarios.count();
        long medicosAntes = medicos.count();
        long pacientesAntes = pacientes.count();

        contasIniciais.run(null);
        dadosDeTeste.run(null);
        contasIniciais.run(null);
        dadosDeTeste.run(null);

        assertEquals(usuariosAntes, usuarios.count());
        assertEquals(medicosAntes, medicos.count());
        assertEquals(pacientesAntes, pacientes.count());
        assertEquals(hashAntes, usuarios.findByEmail("admin@saudeplus.com").map(Usuario::getSenhaHash).orElseThrow());
    }
}
