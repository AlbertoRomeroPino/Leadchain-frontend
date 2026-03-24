import GeoMap from "../components/GeoMap";
import Sidebar from "../layout/Sidebar";
import "../styles/Map.css";

const Map = () => {
  return (
    <div className="map-page">
      <Sidebar />
      <main className="map-content">
        <GeoMap />
      </main>
    </div>
  );
};

export default Map;
