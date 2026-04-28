import Sidebar from "../layout/Sidebar";
import AdminMapView from "../components/MapViews/AdminMapView";
import CommercialMapView from "../components/MapViews/CommercialMapView";
import "../styles/Map.css";
import { useAuth } from "../context/useAuth";

const MapPage = () => {
  const { user } = useAuth();

  if (!user) {
    return <div>Usuario no autenticado</div>;
  }

  return (
    <div className="map-page">
      <Sidebar />
      <main className="map-content">
        {user.rol === "comercial" ? (
          <CommercialMapView userRole={user.rol} userZonaId={user.id_zona ?? undefined} />
        ) : (
          <AdminMapView userRole={user.rol} />
        )}
      </main>
    </div>
  );
};

export default MapPage;
