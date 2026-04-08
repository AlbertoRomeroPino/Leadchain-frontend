import { MapContainer, Polygon, Rectangle, TileLayer } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import "../styles/GeoMap.css";
import {
  CORDOBA_BOUNDS,
  CORDOBA_CENTER,
  MAP_MAX_BOUNDS,
  CORDOBA_OUTER_RING,
  CORDOBA_HOLE,
  CORDOBA_MAP_CONFIG,
} from "./utils/cordobaMapConfig";

const GeoMap = () => {
  return (
    <div className="geo-map-wrapper">
      <MapContainer
        center={CORDOBA_CENTER}
        zoom={CORDOBA_MAP_CONFIG.zoom}
        zoomControl={CORDOBA_MAP_CONFIG.zoomControl}
        attributionControl={CORDOBA_MAP_CONFIG.attributionControl}
        maxBounds={CORDOBA_MAP_CONFIG.maxBounds}
        maxBoundsViscosity={CORDOBA_MAP_CONFIG.maxBoundsViscosity}
        minZoom={CORDOBA_MAP_CONFIG.minZoom}
        className="geo-map-canvas"
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <Polygon
          positions={[CORDOBA_OUTER_RING, CORDOBA_HOLE]}
          pathOptions={{
            color: "transparent",
            fillColor: "#0f0a0a",
            fillOpacity: 0.45,
          }}
          interactive={false}
        />
        <Rectangle
          bounds={CORDOBA_BOUNDS}
          pathOptions={{
            color: "#dc2626",
            weight: 3,
            fillOpacity: 0,
          }}
          interactive={false}
        />
      </MapContainer>
    </div>
  );
};

export default GeoMap;
