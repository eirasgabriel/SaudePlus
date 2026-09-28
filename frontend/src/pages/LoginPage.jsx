import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login } from "../features/auth/auth.api";

export default function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("admin@saudeplus.com");
  const [senha, setSenha] = useState("admin123");
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();
    setErro("");
    setCarregando(true);

    try {
      const dados = await login({ email, senha });
      const usuario = {
        nome: dados.nome ?? "Admin Master",
        email: dados.email ?? email,
        cargo: dados.cargo ?? "Administrador",
        perfil: dados.perfil ?? "administrador",
      };

      localStorage.setItem("saudeplus-token", dados.token ?? "demo-token-saudeplus");
      localStorage.setItem("saudeplus-user", JSON.stringify(usuario));
      navigate("/admin", { replace: true });
    } catch (error) {
      setErro(error.message || "Não foi possível entrar no sistema.");
    } finally {
      setCarregando(false);
    }
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        background: "linear-gradient(135deg, #edf6ff 0%, #e6fff5 100%)",
        fontFamily: "Inter, sans-serif",
        color: "#15314b",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 420,
          background: "#ffffff",
          borderRadius: 20,
          boxShadow: "0 18px 40px rgba(21, 49, 75, 0.12)",
          padding: 32,
        }}
      >
        <div style={{ marginBottom: 22, textAlign: "center" }}>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              width: 72,
              height: 72,
              borderRadius: 18,
              background: "#dff4ee",
              fontWeight: 800,
              fontSize: 28,
              color: "#0e8f6b",
              marginBottom: 14,
            }}
          >
            +
          </div>
          <h1 style={{ margin: 0, fontSize: 30 }}>SaúdePlus</h1>
          <p style={{ margin: "10px 0 0", color: "#5d7286" }}>
            Acesso administrativo
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: "grid", gap: 18 }}>
          <label style={{ display: "grid", gap: 8 }}>
            <span style={{ fontWeight: 600 }}>E-mail</span>
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
              style={{
                padding: "12px 14px",
                borderRadius: 12,
                border: "1px solid #d7e4ef",
                fontSize: 15,
              }}
            />
          </label>

          <label style={{ display: "grid", gap: 8 }}>
            <span style={{ fontWeight: 600 }}>Senha</span>
            <input
              type="password"
              value={senha}
              onChange={(event) => setSenha(event.target.value)}
              required
              style={{
                padding: "12px 14px",
                borderRadius: 12,
                border: "1px solid #d7e4ef",
                fontSize: 15,
              }}
            />
          </label>

          {erro && (
            <div
              style={{
                background: "#fff3f3",
                color: "#b42318",
                border: "1px solid #f3b5b5",
                borderRadius: 10,
                padding: "10px 12px",
                fontSize: 14,
              }}
            >
              {erro}
            </div>
          )}

          <button
            type="submit"
            disabled={carregando}
            style={{
              border: "none",
              borderRadius: 12,
              background: "linear-gradient(135deg, #1b7ef2 0%, #0a9f7f 100%)",
              color: "#fff",
              fontSize: 15,
              fontWeight: 700,
              padding: "14px 18px",
              cursor: carregando ? "wait" : "pointer",
            }}
          >
            {carregando ? "Entrando..." : "Entrar"}
          </button>
        </form>

        <div style={{ marginTop: 18, fontSize: 13, color: "#5d7286", textAlign: "center" }}>
          Demo: admin@saudeplus.com / admin123
        </div>
      </div>
    </div>
  );
}
