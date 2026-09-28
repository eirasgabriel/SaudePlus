package br.com.saudeplus.security;

import java.util.List;

import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

import br.com.saudeplus.clinicas.Clinica;
import br.com.saudeplus.clinicas.ClinicaRepository;
import br.com.saudeplus.exames.Exame;
import br.com.saudeplus.exames.ExameRepository;
import br.com.saudeplus.profissionais.Profissional;
import br.com.saudeplus.profissionais.ProfissionalRepository;
import br.com.saudeplus.usuarios.Usuario;
import br.com.saudeplus.usuarios.UsuarioRepository;

@Configuration
public class DataSeeder {

    @Bean
    CommandLineRunner seedAdminUser(UsuarioRepository usuarioRepository, PasswordEncoder passwordEncoder,
            ClinicaRepository clinicaRepository, ProfissionalRepository profissionalRepository,
            ExameRepository exameRepository, br.com.saudeplus.agendamentos.AgendamentoRepository agendamentoRepository) {
        return args -> {
            if (usuarioRepository.findByEmailIgnoreCase("admin@saudeplus.com").isEmpty()) {
                Usuario admin = new Usuario(
                        "Admin Master",
                        "admin@saudeplus.com",
                        passwordEncoder.encode("admin123"),
                        "Administrador");
                admin.setPerfil("administrador");
                admin.setStatus("ativo");
                admin.setCpf("123.456.789-00");
                admin.setTelefone("(22) 99876-5432");
                usuarioRepository.save(admin);
            }

            if (usuarioRepository.findByEmailIgnoreCase("maria.silva@saudeplus.com").isEmpty()) {
                Usuario paciente = new Usuario(
                        "Maria Silva",
                        "maria.silva@saudeplus.com",
                        passwordEncoder.encode("paciente123"),
                        "Paciente");
                paciente.setPerfil("paciente");
                paciente.setStatus("ativo");
                paciente.setCpf("234.567.890-11");
                paciente.setTelefone("(22) 99123-4567");
                usuarioRepository.save(paciente);
            }

            seedUsuarioEquipe(usuarioRepository, passwordEncoder, "Danielle Gil Silva", "danielle@saudeplus.com",
                    "Gestora de Sistema", "gestor", "Todas");
            seedUsuarioEquipe(usuarioRepository, passwordEncoder, "Ana Júlia da Silva", "ana.julia@saudeplus.com",
                    "Recepcionista", "recepcionista", "Unidade Centro");
            seedUsuarioEquipe(usuarioRepository, passwordEncoder, "Fabrício Lima Galisa", "fabricio@saudeplus.com",
                    "Médico", "medico", "Unidade Centro");
            seedUsuarioEquipe(usuarioRepository, passwordEncoder, "Gabriel Pereira M. Moreira", "gabriel@saudeplus.com",
                    "Enfermeiro", "enfermeiro", "Unidade Itaúna");
            seedUsuarioEquipe(usuarioRepository, passwordEncoder, "Jean Lucas Fernandes Martins", "jean.lucas@saudeplus.com",
                    "Recepcionista", "recepcionista", "Unidade Itaúna");
            seedUsuarioEquipe(usuarioRepository, passwordEncoder, "Dayana Batista", "dayana@saudeplus.com",
                    "Recepcionista", "recepcionista", "Unidade Centro");

            if (clinicaRepository.count() == 0) {
                Clinica c1 = new Clinica("UBS Central", "Clínica Geral", "Rua das Flores, 123", "Centro - Saquarema/RJ", "(22) 99876-5432", "ativa");
                c1.setCnpj("12.345.678/0001-90");
                c1.setUnidade("Unidade Centro");
                c1.setEmail("ubscentral@saudeplus.com");
                c1.setHorarioFuncionamento("Segunda a Sexta: 07:00 - 17:00 · Sábado: 07:00 - 12:00");

                Clinica c2 = new Clinica("UBS Jaconé", "Clínica Geral", "Av. Beira Mar, 456", "Jaconé - Saquarema/RJ", "(22) 99911-2233", "ativa");
                c2.setCnpj("98.765.432/0001-11");
                c2.setUnidade("Unidade Jaconé");
                c2.setEmail("ubsjacone@saudeplus.com");

                Clinica c3 = new Clinica("Policlínica Saquarema", "Especialidades", "Av. Saquarema, 1000", "Centro - Saquarema/RJ", "(22) 99888-7766", "ativa");
                c3.setCnpj("55.666.777/0001-88");
                c3.setUnidade("Unidade Centro");
                c3.setEmail("policlinica@saudeplus.com");

                Clinica c4 = new Clinica("Clínica Vida & Saúde", "Ginecologia / Obstetrícia", "Rua do Comércio, 45", "Sampaio Corrêa - Saquarema/RJ", "(22) 99321-0876", "manutencao");
                c4.setCnpj("44.555.666/0001-77");
                c4.setUnidade("Unidade Boqueirão");
                c4.setEmail("vidaesaude@saudeplus.com");

                clinicaRepository.saveAll(List.of(c1, c2, c3, c4));
            }

            if (profissionalRepository.count() == 0) {
                profissionalRepository.saveAll(List.of(
                        new Profissional("Dr. Carlos Mendes", "Cardiologia", "Clínica da Família - Centro", "Disponível"),
                        new Profissional("Dra. Beatriz Almeida", "Dermatologia", "Policlínica Municipal", "Disponível"),
                        new Profissional("Dr. Marcelo Santos", "Clínica Geral", "Posto de Saúde - Jaconé", "Disponível"))
                );
            }

            if (exameRepository.count() == 0) {
                exameRepository.saveAll(List.of(
                        new Exame("Hemograma Completo", "Laboratorial", 30, true),
                        new Exame("Raio-X de Tórax", "Imagem", 20, true),
                        new Exame("Ultrassonografia Abdominal", "Imagem", 45, true))
                );
            }

            if (agendamentoRepository.count() == 0) {
                br.com.saudeplus.agendamentos.Agendamento a1 = new br.com.saudeplus.agendamentos.Agendamento();
                a1.setPacienteId(1L);
                a1.setProfissionalId(1L);
                a1.setPaciente("Maria Souza");
                a1.setMedico("Dr. Fernando Costa");
                a1.setData("2026-09-30");
                a1.setHora("08:30");
                a1.setTipo("Consulta");
                a1.setStatus("confirmado");

                br.com.saudeplus.agendamentos.Agendamento a2 = new br.com.saudeplus.agendamentos.Agendamento();
                a2.setPacienteId(2L);
                a2.setProfissionalId(2L);
                a2.setPaciente("João Pereira");
                a2.setMedico("Dra. Ana Lima");
                a2.setData("2026-10-02");
                a2.setHora("14:00");
                a2.setTipo("Exame");
                a2.setStatus("pendente");

                agendamentoRepository.saveAll(List.of(a1, a2));
            }
        };
    }

    private void seedUsuarioEquipe(UsuarioRepository usuarioRepository, PasswordEncoder passwordEncoder,
            String nome, String email, String cargo, String perfil, String unidade) {
        if (usuarioRepository.findByEmailIgnoreCase(email).isPresent()) {
            return;
        }

        Usuario usuario = new Usuario(nome, email, passwordEncoder.encode("saudeplus123"), cargo);
        usuario.setPerfil(perfil);
        usuario.setStatus("ativo");
        usuario.setUnidade(unidade);
        usuarioRepository.save(usuario);
    }
}
