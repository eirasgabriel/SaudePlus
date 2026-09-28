package br.com.saudeplus.profissionais;

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

import br.com.saudeplus.profissionais.dto.ProfissionalRequest;

@RestController
@RequestMapping("/api/profissionais")
public class ProfissionalController {

    private final ProfissionalService profissionalService;

    public ProfissionalController(ProfissionalService profissionalService) {
        this.profissionalService = profissionalService;
    }

    @GetMapping
    public ResponseEntity<List<Map<String, Object>>> listar() {
        return ResponseEntity.ok(profissionalService.listar().stream().map(this::toMap).toList());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Map<String, Object>> buscarPorId(@PathVariable Long id) {
        return ResponseEntity.ok(toMap(profissionalService.buscarPorId(id)));
    }

    @PostMapping
    public ResponseEntity<Map<String, Object>> criar(@Valid @RequestBody ProfissionalRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(toMap(profissionalService.criar(request)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Map<String, Object>> atualizar(@PathVariable Long id,
                                                           @Valid @RequestBody ProfissionalRequest request) {
        return ResponseEntity.ok(toMap(profissionalService.atualizar(id, request)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletar(@PathVariable Long id) {
        profissionalService.deletar(id);
        return ResponseEntity.noContent().build();
    }

    private Map<String, Object> toMap(Profissional profissional) {
        Map<String, Object> item = new LinkedHashMap<>();
        item.put("id", profissional.getId());
        item.put("nome", profissional.getNome());
        item.put("especialidade", profissional.getEspecialidade());
        item.put("clinica", profissional.getClinica());
        item.put("disponibilidade", profissional.getDisponibilidade());
        return item;
    }
}
