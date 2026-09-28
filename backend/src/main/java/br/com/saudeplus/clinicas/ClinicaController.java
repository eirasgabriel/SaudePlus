package br.com.saudeplus.clinicas;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

import jakarta.validation.Valid;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import br.com.saudeplus.clinicas.dto.ClinicaRequest;

@RestController
@RequestMapping("/api/clinicas")
public class ClinicaController {

    private final ClinicaService clinicaService;

    public ClinicaController(ClinicaService clinicaService) {
        this.clinicaService = clinicaService;
    }

    @GetMapping
    public ResponseEntity<List<Map<String, Object>>> listar() {
        return ResponseEntity.ok(clinicaService.listar().stream().map(this::toMap).toList());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Map<String, Object>> buscarPorId(@PathVariable Long id) {
        return ResponseEntity.ok(toMap(clinicaService.buscarPorId(id)));
    }

    @PostMapping
    public ResponseEntity<Map<String, Object>> criar(@Valid @RequestBody ClinicaRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(toMap(clinicaService.criar(request)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Map<String, Object>> atualizar(@PathVariable Long id,
                                                           @Valid @RequestBody ClinicaRequest request) {
        return ResponseEntity.ok(toMap(clinicaService.atualizar(id, request)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletar(@PathVariable Long id) {
        clinicaService.deletar(id);
        return ResponseEntity.noContent().build();
    }

    private Map<String, Object> toMap(Clinica clinica) {
        Map<String, Object> item = new LinkedHashMap<>();
        item.put("id", clinica.getId());
        item.put("nome", clinica.getNome());
        item.put("especialidade", clinica.getEspecialidade());
        item.put("endereco", clinica.getEndereco());
        item.put("cidade", clinica.getCidade());
        item.put("telefone", clinica.getTelefone());
        item.put("status", clinica.getStatus());
        item.put("cnpj", clinica.getCnpj());
        item.put("unidade", clinica.getUnidade());
        item.put("email", clinica.getEmail());
        item.put("horarioFuncionamento", clinica.getHorarioFuncionamento());
        return item;
    }
}
