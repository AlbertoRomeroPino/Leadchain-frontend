import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import type { LoginCredentials } from "../types/users/User";
import { useAuth } from "../auth/useAuth";
import { authService } from "../services/authService";
import showStatusAlert from "../components/StatusAlert";
import "../styles/Login.css";

const Login = () => {
  const navigate = useNavigate();
  const { isAuthenticated, login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (isAuthenticated) {
    return <Navigate to="/Inicio" replace />;
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    const missingFields: string[] = [];
    if (!email.trim()) missingFields.push("email");
    if (!password.trim()) missingFields.push("contraseña");

    if (missingFields.length > 0) {
      const alertType = missingFields.length > 1 ? "warning" : "info";
      const description = `Faltan: ${missingFields.join(", ")}.`;
      setError(description);
      showStatusAlert({
        type: alertType,
        title: "Campos obligatorios",
        description,
      });
      return;
    }

    const credentials: LoginCredentials = {
      email: email.trim(),
      password,
    };

    try {
      setLoading(true);
      showStatusAlert({
        type: "loading",
        title: "Entrando...",
        description: "Validando tus credenciales",
      });

      const session = await authService.login(credentials);
      login(session);
      const nombre = session.user?.nombre ?? "usuario";

      showStatusAlert({
        type: "success",
        title: "Acceso correcto",
        description: `Has accedido ${nombre}`,
      });

      navigate("/Inicio", { replace: true });
    } catch (error) {
      let message = "No se pudo iniciar sesión. Revisa tus credenciales.";

      if (
        typeof error === "object" &&
        error !== null &&
        "response" in error &&
        typeof (error as { response?: unknown }).response === "object" &&
        (error as { response?: { data?: unknown } }).response?.data &&
        typeof (error as { response?: { data?: { message?: unknown } } })
          .response?.data?.message === "string"
      ) {
        message = (error as { response: { data: { message: string } } })
          .response.data.message;
      }

      setError(message);
      showStatusAlert({
        type: "error",
        title: "Error",
        description: message,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="login-page">
      <section className="login-card">
        <h1 className="login-title">Login</h1>
        <p className="login-label">Introduzca sus datos para iniciar sesión</p>

        <form className="login-form" onSubmit={handleSubmit}>
          <div className="login-field">
            <input
              className="login-input"
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="username"
              required
            />
          </div>

          <div className="login-field">
            <input
              className="login-input"
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              required
            />
          </div>

          <button className="login-button" type="submit" disabled={loading}>
            {loading ? "Entrando..." : "Entrar"}
          </button>
        </form>

        {error && <p className="login-error">{error}</p>}
      </section>
    </main>
  );
};

export default Login;
