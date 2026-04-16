import { Link, useNavigate } from "react-router-dom";
import "../styles/NotFound.css";
import { useAuth } from "../auth/useAuth";

const NotFoundBSOD = () => {
  const navigate = useNavigate();
  const { isAuthenticated, logout } = useAuth();

  const handleLogout = () => {
    if (isAuthenticated) {
      logout();
    }
    navigate("/Login", { replace: true });
  };

  return (
    <main className="notfound-page">
      <section className="notfound-card" aria-labelledby="notfound-title">
        <p className="notfound-code">404</p>

        <h1 id="notfound-title" className="notfound-title">
          Esta página no está disponible
        </h1>

        <p className="notfound-description">
          La ruta que intentas abrir no existe o fue movida. Puedes volver al
          inicio para seguir gestionando clientes, visitas y zonas.
        </p>

        <div className="notfound-actions">
          <Link className="notfound-button notfound-button-primary" to="/Inicio">
            Ir al inicio
          </Link>
          <button
            className="notfound-button notfound-button-secondary"
            type="button"
            onClick={handleLogout}
          >
            Volver al login
          </button>
        </div>

        <p className="notfound-help">
          Si el problema continúa, comparte este código con soporte:
          <span className="notfound-stop-code"> PAGE_NOT_FOUND_404</span>
        </p>
      </section>
    </main>
  );
};

export default NotFoundBSOD;