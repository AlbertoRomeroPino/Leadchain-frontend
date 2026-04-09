import { useAuth } from "../auth/useAuth";
import Sidebar from "../layout/Sidebar";
import InicioComercial from "../components/Inicio/InicioComercial/InicioComercial";
import InicioAdmin from "../components/Inicio/InicioAdmin/InicioAdmin";
import "../styles/InicioComercial.css";
import "../styles/InicioAdmin.css";

const InicioPage = () => {
  const { user } = useAuth();

  return (
    <>
      <Sidebar />
      <main style={{ marginLeft: "80px", padding: "20px" }}>
        <h1>Bienvenido a Leadchain</h1>
        {user?.rol === "comercial" ? (
          <InicioComercial />
        ) : user?.rol === "admin" ? (
          <InicioAdmin />
        ) : (
          <p>Selecciona una sección del menú para comenzar a gestionar tus clientes y visitas.</p>
        )}
      </main>
    </>
  );
};

export default InicioPage;
