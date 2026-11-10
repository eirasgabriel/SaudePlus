package br.com.saudeplus.security;

import java.io.IOException;

import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.DisabledException;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.AuthenticationEntryPoint;
import org.springframework.security.web.access.AccessDeniedHandler;
import org.springframework.stereotype.Component;

import br.com.saudeplus.exception.ErroResposta;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import tools.jackson.databind.json.JsonMapper;

/**
 * 401 e 403 barrados pelo Spring Security acontecem antes dos controllers,
 * então o `TratadorDeErros` não os vê. Esta classe escreve o mesmo
 * {@link ErroResposta} para o front tratar tudo igual.
 */
@Component
class RespostasDeSeguranca implements AuthenticationEntryPoint, AccessDeniedHandler {

    private final JsonMapper json;

    RespostasDeSeguranca(JsonMapper json) {
        this.json = json;
    }

    @Override
    public void commence(HttpServletRequest requisicao, HttpServletResponse resposta, AuthenticationException excecao)
            throws IOException {
        String mensagem;
        if (excecao instanceof DisabledException) {
            mensagem = "Sua conta está desativada. Procure o suporte.";
        } else if (requisicao.getHeader(HttpHeaders.AUTHORIZATION) != null) {
            mensagem = "Sua sessão expirou ou é inválida. Entre novamente.";
        } else {
            mensagem = "Entre na sua conta para continuar.";
        }
        resposta.setHeader(HttpHeaders.WWW_AUTHENTICATE, "Bearer");
        escrever(resposta, requisicao, HttpStatus.UNAUTHORIZED, mensagem);
    }

    @Override
    public void handle(HttpServletRequest requisicao, HttpServletResponse resposta, AccessDeniedException excecao)
            throws IOException {
        escrever(resposta, requisicao, HttpStatus.FORBIDDEN, "Seu perfil não tem acesso a este recurso.");
    }

    private void escrever(HttpServletResponse resposta, HttpServletRequest requisicao, HttpStatus status, String mensagem)
            throws IOException {
        resposta.setStatus(status.value());
        resposta.setContentType(MediaType.APPLICATION_JSON_VALUE);
        resposta.setCharacterEncoding("UTF-8");
        ErroResposta corpo = ErroResposta.de(status.value(), status.getReasonPhrase(), mensagem, requisicao.getRequestURI());
        json.writeValue(resposta.getWriter(), corpo);
    }
}
