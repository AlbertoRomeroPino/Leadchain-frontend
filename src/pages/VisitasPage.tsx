import Sidebar from "../layout/Sidebar";
import VisitasAdminGrid from "../components/Visitas/Admin/VisitasAdminGrid";
import VisitasComercialGrid from "../components/Visitas/Comercial/VisitasComercialGrid";
import "../styles/Visitas.css";
import { useAuth } from "../context/useAuth";

const Visitas = () => {
  const { user } = useAuth();

  return (
    <>
      <Sidebar />

      <main className="visitas-page">
        {user?.rol === "admin" ? (
        <VisitasAdminGrid />
        ) : (
          <VisitasComercialGrid />
        )}
      </main>
    </>
  );
};

export default Visitas;
