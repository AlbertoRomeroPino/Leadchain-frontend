import { useAuth } from "../auth/useAuth";
import Sidebar from "../layout/Sidebar";
import InicioComercial from "../components/Inicio/InicioComercial/InicioComercial";
import InicioAdmin from "../components/Inicio/InicioAdmin/InicioAdmin";
import "../styles/InicioPage.css";
import "../styles/InicioComercial.css";
import "../styles/InicioAdmin.css";

const InicioPage = () => {
  const { user } = useAuth();

  return (
    <>
      <Sidebar />
      <main className="inicio-page-main">
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
