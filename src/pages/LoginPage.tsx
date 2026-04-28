import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import type { LoginCredentials } from "../types";
import type { AxiosError } from "axios";
import { useAuth } from "../auth/useAuth";
import { authService } from "../services/authService";
import { showLoadingAlert, showErrorAlert, showSuccessAlert } from "../components/utils/errorHandler";
import "../styles/Login.css";

const Login = () => {
  const navigate = useNavigate();
  const { isAuthenticated, login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (isAuthenticated) {
    return <Navigate to="/Inicio" replace />;
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const missingFields: string[] = [];
    if (!email.trim()) missingFields.push("email");
    if (!password.trim()) missingFields.push("contraseña");

    if (missingFields.length > 0) {
      showErrorAlert(new Error(`Faltan: ${missingFields.join(", ")}.`), "Campos Vacíos");
      return;
    }

    // Validar que la contraseña tenga al menos 8 caracteres
    if (password.length < 8) {
      showErrorAlert(
        new Error("La contraseña debe tener al menos 8 caracteres"),
        "Contraseña Corta"
      );
      return;
    }

    const credentials: LoginCredentials = {
      email: email.trim(),
      password,
    };

    try {
      setIsSubmitting(true);
      showLoadingAlert("Iniciando sesión...");
      const session = await authService.login(credentials);
      login(session);
      showSuccessAlert("¡Sesión iniciada!");
      navigate("/Inicio", { replace: true });
    } catch (error) {
      // Detectar tipo de error por status HTTP
      let title = "Credenciales";
      const axiosError = error as AxiosError;
      
      if (axiosError?.response?.status) {
        const status = axiosError.response.status;
        
        // Status 500+ = problemas de servidor/conexión
        if (status >= 500) {
          title = "Conexión";
        }
        // Status 401 = credenciales inválidas
        else if (status === 401) {
          title = "Credenciales";
        }
      }
      
      showErrorAlert(error, title);
    } finally {
      setIsSubmitting(false);
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

          <button className="login-button" type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Entrando..." : "Entrar"}
          </button>
        </form>
      </section>
    </main>
  );
};

export default Login;
