import { useAuth } from "../context/useAuth";
import Sidebar from "../layout/Sidebar";
import ClientesAdminView from "../components/Clientes/Admin/ClientesAdminView";
import ClientesComercialView from "../components/Clientes/Comercial/ClientesComercialView";
import "../styles/Clientes.css";

const ClientesPage = () => {
  const { user } = useAuth();

  if (!user) {
    return (
      <>
        <Sidebar />
        <div className="page-layout-wrapper">
          <main className="clientes-main">
            <p>Cargando usuario...</p>
          </main>
        </div>
      </>
    );
  }

  return (
    <div className="clientes-wrapper">
      <Sidebar />
      <main className="clientes-main">
        {user.rol === "admin" ? (
          <ClientesAdminView />
        ) : user.rol === "comercial" ? (
          <ClientesComercialView />
        ) : (
          <p>Rol no permitido para acceder a Clientes</p>
        )}
      </main>
    </div>
  );
};

export default ClientesPage;
