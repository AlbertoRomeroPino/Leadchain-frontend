import { MapContainer, Polygon, Rectangle, TileLayer } from "react-leaflet";
import type { LatLngBoundsExpression, LatLngExpression } from "leaflet";
import "leaflet/dist/leaflet.css";
import "../styles/GeoMap.css";

// Coordenadas del rectángulo que representa Córdoba
const cordobaBounds: LatLngBoundsExpression = [
  [37.785, -4.965],
  [37.965, -4.665],
];

// Límites máximos del mapa
const mapBounds: LatLngBoundsExpression = [
  [37.75, -5.02],
  [37.99, -4.62],
];

// Extraemos las coordenadas del rectángulo de Córdoba para definir el "agujero" en el polígono
const [cordobaSouthWest, cordobaNorthEast] = cordobaBounds as [
  [number, number],
  [number, number],
];

// Definimos un polígono que cubre toda la región, con un "agujero" en forma de rectángulo para Córdoba
const outerRing: LatLngExpression[] = [
  [-90, -180],
  [-90, 180],
  [90, 180],
  [90, -180],
];
// El "agujero" para Córdoba se define con las mismas coordenadas que el rectángulo de Córdoba
const cordobaHole: LatLngExpression[] = [
  [cordobaSouthWest[0], cordobaSouthWest[1]],
  [cordobaSouthWest[0], cordobaNorthEast[1]],
  [cordobaNorthEast[0], cordobaNorthEast[1]],
  [cordobaNorthEast[0], cordobaSouthWest[1]],
];

// Calculamos el centro de Córdoba para centrar el mapa
const cordobaCenter: LatLngExpression = [37.8847, -4.7792];

const GeoMap = () => {
  return (
    <div className="geo-map-wrapper">
      <MapContainer
        center={cordobaCenter}
        zoom={13}
        zoomControl={false}
        attributionControl={false}
        maxBounds={mapBounds}
        maxBoundsViscosity={1}
        minZoom={11}
        className="geo-map-canvas"
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <Polygon
          positions={[outerRing, cordobaHole]}
          pathOptions={{
            color: "transparent",
            fillColor: "#0f0a0a",
            fillOpacity: 0.45,
          }}
          interactive={false}
        />
        <Rectangle
          bounds={cordobaBounds}
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
