package br.com.saudeplus.usuarios;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import br.com.saudeplus.exception.ResourceNotFoundException;
import br.com.saudeplus.usuarios.dto.UsuarioRequest;

@Service
public class UsuarioService {

    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;

    public UsuarioService(UsuarioRepository usuarioRepository, PasswordEncoder passwordEncoder) {
        this.usuarioRepository = usuarioRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public List<Map<String, Object>> listar() {
        return usuarioRepository.findAll().stream().map(this::toMap).toList();
    }

    public Map<String, Object> buscarPorId(Long id) {
        return toMap(buscarEntidade(id));
    }

    public Map<String, Object> criar(UsuarioRequest request) {
        if (request.senha() == null || request.senha().isBlank()) {
            throw new IllegalArgumentException("Senha é obrigatória para novos usuários.");
        }

        if (usuarioRepository.findByEmailIgnoreCase(request.email().trim()).isPresent()) {
            throw new IllegalArgumentException("Já existe um usuário cadastrado com esse e-mail.");
        }

        Usuario usuario = new Usuario();
        aplicarCamposBasicos(usuario, request);
        usuario.setSenha(passwordEncoder.encode(request.senha()));

        return toMap(usuarioRepository.save(usuario));
    }

    public Map<String, Object> atualizar(Long id, UsuarioRequest request) {
        Usuario usuario = buscarEntidade(id);
        aplicarCamposBasicos(usuario, request);

        if (request.senha() != null && !request.senha().isBlank()) {
            usuario.setSenha(passwordEncoder.encode(request.senha()));
        }

        return toMap(usuarioRepository.save(usuario));
    }

    public void deletar(Long id) {
        Usuario usuario = buscarEntidade(id);
        usuarioRepository.delete(usuario);
    }

    private void aplicarCamposBasicos(Usuario usuario, UsuarioRequest request) {
        usuario.setNome(request.nome());
        usuario.setEmail(request.email().trim());
        usuario.setCargo(request.cargo());
        usuario.setPerfil(request.perfil() == null || request.perfil().isBlank() ? "paciente" : request.perfil());
        usuario.setStatus(request.status() == null || request.status().isBlank() ? "ativo" : request.status());
        if (request.cpf() != null && !request.cpf().isBlank()) {
            usuario.setCpf(request.cpf());
        }
        if (request.telefone() != null && !request.telefone().isBlank()) {
            usuario.setTelefone(request.telefone());
        }
        if (request.unidade() != null && !request.unidade().isBlank()) {
            usuario.setUnidade(request.unidade());
        }
    }

    private Usuario buscarEntidade(Long id) {
        return usuarioRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Usuário não encontrado: " + id));
    }

    private Map<String, Object> toMap(Usuario usuario) {
        Map<String, Object> item = new LinkedHashMap<>();
        item.put("id", usuario.getId());
        item.put("nome", usuario.getNome());
        item.put("cargo", usuario.getCargo());
        item.put("email", usuario.getEmail());
        item.put("telefone", usuario.getTelefone());
        item.put("perfil", usuario.getPerfil());
        item.put("status", usuario.getStatus());
        item.put("ultimoAcesso", usuario.getUltimoAcesso());
        item.put("cpf", usuario.getCpf());
        item.put("unidade", usuario.getUnidade());
        return item;
    }
}
