package br.com.saudeplus.exames;

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

import br.com.saudeplus.exames.dto.ExameRequest;

@RestController
@RequestMapping("/api/exames")
public class ExameController {

    private final ExameService exameService;

    public ExameController(ExameService exameService) {
        this.exameService = exameService;
    }

    @GetMapping
    public ResponseEntity<List<Map<String, Object>>> listar() {
        return ResponseEntity.ok(exameService.listar().stream().map(this::toMap).toList());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Map<String, Object>> buscarPorId(@PathVariable Long id) {
        return ResponseEntity.ok(toMap(exameService.buscarPorId(id)));
    }

    @PostMapping
    public ResponseEntity<Map<String, Object>> criar(@Valid @RequestBody ExameRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(toMap(exameService.criar(request)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Map<String, Object>> atualizar(@PathVariable Long id,
                                                           @Valid @RequestBody ExameRequest request) {
        return ResponseEntity.ok(toMap(exameService.atualizar(id, request)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletar(@PathVariable Long id) {
        exameService.deletar(id);
        return ResponseEntity.noContent().build();
    }

    private Map<String, Object> toMap(Exame exame) {
        Map<String, Object> item = new LinkedHashMap<>();
        item.put("id", exame.getId());
        item.put("nome", exame.getNome());
        item.put("categoria", exame.getCategoria());
        item.put("duracaoMinutos", exame.getDuracaoMinutos());
        item.put("disponivel", exame.isDisponivel());
        return item;
    }
}
