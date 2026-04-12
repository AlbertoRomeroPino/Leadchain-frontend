import { useAuth } from "../auth/useAuth";
import Sidebar from "../layout/Sidebar";
import InicioComercial from "../components/Inicio/InicioComercial/InicioComercial";
import InicioAdmin from "../components/Inicio/InicioAdmin/InicioAdmin";
import "../styles/InicioPage.css";
import "../styles/InicioComercial.css";
import "../styles/InicioAdmin.css";

const InicioPage = () => {
  const { user } = useAuth();

  if (!user) {
    return (
      <>
        <Sidebar />
        <div className="page-layout-wrapper">
          <main className="inicio-page-main">
            <p>Cargando usuario...</p>
          </main>
        </div>
      </>
    );
  }

  return (
    <>
      <Sidebar />
      <div className="page-layout-wrapper">
        <main className="inicio-page-main">
          {user.rol === "comercial" ? (
            <InicioComercial />
          ) : user.rol === "admin" ? (
            <InicioAdmin />
          ) : (
            <p>Selecciona una sección del menú para comenzar a gestionar tus clientes y visitas.</p>
          )}
        </main>
      </div>
    </>
  );
};

export default InicioPage;
