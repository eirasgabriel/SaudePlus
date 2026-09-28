package br.com.saudeplus.clinicas;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

@SpringBootTest
class ClinicaRepositoryTest {

    @Autowired
    private ClinicaRepository clinicaRepository;

    @Test
    void shouldPersistAndFindClinicas() {
        Clinica clinica = new Clinica();
        clinica.setNome("Clínica Teste");
        clinica.setEndereco("Rua do Teste, 123");
        clinica.setCidade("Curitiba");
        clinica.setTelefone("(41) 3333-4444");
        clinica.setEspecialidade("Clínica Geral");
        clinica.setStatus("ativa");

        Clinica saved = clinicaRepository.save(clinica);

        assertThat(saved.getId()).isNotNull();
        assertThat(clinicaRepository.findAll())
                .extracting(Clinica::getNome)
                .contains("Clínica Teste");
    }
}
