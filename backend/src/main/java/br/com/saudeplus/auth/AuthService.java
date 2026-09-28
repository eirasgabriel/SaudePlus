package br.com.saudeplus.auth;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.Optional;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import br.com.saudeplus.security.JwtService;
import br.com.saudeplus.usuarios.Usuario;
import br.com.saudeplus.usuarios.UsuarioRepository;

@Service
public class AuthService {

    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public AuthService(UsuarioRepository usuarioRepository, PasswordEncoder passwordEncoder, JwtService jwtService) {
        this.usuarioRepository = usuarioRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    public Map<String, Object> login(LoginRequest request) {
        if (request == null || request.email() == null || request.senha() == null) {
            throw new IllegalArgumentException("Credenciais inválidas.");
        }

        String emailNormalizado = request.email().trim();
        Optional<Usuario> usuarioOpt = usuarioRepository.findByEmailIgnoreCase(emailNormalizado);

        if (usuarioOpt.isEmpty() || !passwordEncoder.matches(request.senha(), usuarioOpt.get().getSenha())) {
            throw new IllegalArgumentException("Credenciais inválidas.");
        }

        Usuario usuario = usuarioOpt.get();
        usuario.setUltimoAcesso(LocalDateTime.now().format(DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm")));
        usuarioRepository.save(usuario);

        Map<String, Object> payload = new LinkedHashMap<>();
        payload.put("usuarioId", usuario.getId().intValue());
        payload.put("nome", usuario.getNome());
        payload.put("email", usuario.getEmail());
        payload.put("cargo", usuario.getCargo());
        payload.put("perfil", usuario.getPerfil());
        payload.put("token", jwtService.generateToken(usuario));

        return payload;
    }
}
