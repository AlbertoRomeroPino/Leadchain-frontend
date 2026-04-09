import { MapContainer, Polygon, Rectangle, TileLayer, Popup, Marker } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import "../../styles/GlovalMap.css";
import {
  CORDOBA_BOUNDS,
  CORDOBA_CENTER,
  CORDOBA_MAP_CONFIG,
  CORDOBA_OUTER_RING,
  CORDOBA_HOLE,
} from "./cordobaMapConfig";
import type { Zona } from "../../types/zonas/Zona";
import type { Edificio } from "../../types/edificios/Edificio";
import type { GeoPoint } from "../../types/shared/GeoPoint";
import type { LatLngExpression, LatLngBoundsExpression } from "leaflet";
import { useMemo } from "react";
import L from "leaflet";

interface GlovalMapProps {
  zonas?: Zona[];
  edificios?: Edificio[];
  userRole?: string;
  userZonaId?: number;
  title?: string;
  centerCoords?: [number, number];
  zoomLevel?: number;
  minZoomLevel?: number;
  customMaxBounds?: LatLngBoundsExpression;
  onEdificioClick?: (edificio: Edificio) => void;
}

const GlovalMap = ({
  zonas = [],
  edificios = [],
  userRole = "admin",
  userZonaId,
  title = "Mapa de Córdoba",
  centerCoords = CORDOBA_CENTER,
  zoomLevel = CORDOBA_MAP_CONFIG.zoom,
  minZoomLevel = CORDOBA_MAP_CONFIG.minZoom,
  customMaxBounds = CORDOBA_MAP_CONFIG.maxBounds,
  onEdificioClick,
}: GlovalMapProps) => {
  // Filtrar zonas según el rol del usuario
  const zonasAMostrar = useMemo(() => {
    if (!zonas || zonas.length === 0) return [];

    if (userRole === "comercial" && userZonaId) {
      return zonas.filter((zona) => zona.id === userZonaId);
    }

    return zonas;
  }, [zonas, userRole, userZonaId]);

  // Filtrar edificios según el rol del usuario
  const edificiosAMostrar = useMemo(() => {
    if (!edificios || edificios.length === 0) return [];

    if (userRole === "comercial" && userZonaId) {
      return edificios.filter((edif) => edif.id_zona === userZonaId);
    }

    return edificios;
  }, [edificios, userRole, userZonaId]);

  // Crear icono personalizado para edificios
  const edificioIcon = useMemo(() => {
    return L.icon({
      iconUrl:
        "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iNDIiIHZpZXdCb3g9IjAgMCAzMiA0MiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB4PSI0IiB5PSI0IiB3aWR0aD0iMjQiIGhlaWdodD0iMjgiIHJ4PSIyIiBmaWxsPSIjMzc4OGQ5Ii8+PGNpcmNsZSBjeD0iMTYiIGN5PSI4IiByPSIyIiBmaWxsPSIjZmZmZiIvPjxyZWN0IHg9IjgiIHk9IjEyIiB3aWR0aD0iNSIgaGVpZ2h0PSI0IiBmaWxsPSIjZmZmZiIgb3BhY2l0eT0iMC41Ii8+PHJlY3QgeD0iMTkiIHk9IjEyIiB3aWR0aD0iNSIgaGVpZ2h0PSI0IiBmaWxsPSIjZmZmZiIgb3BhY2l0eT0iMC41Ii8+PHJlY3QgeD0iOCIgeT0iMjAiIHdpZHRoPSI1IiBoZWlnaHQ9IjQiIGZpbGw9IiNmZmZmIiBvcGFjaXR5PSIwLjUiLz48cmVjdCB4PSIxOSIgeT0iMjAiIHdpZHRoPSI1IiBoZWlnaHQ9IjQiIGZpbGw9IiNmZmZmIiBvcGFjaXR5PSIwLjUiLz48cGF0aCBkPSJNNCA0MkwxNiAzNEwyOCA0MloiIGZpbGw9IiMzNzg4ZDkiLz48L3N2Zz4=",
      iconSize: [32, 42],
      iconAnchor: [16, 42],
      popupAnchor: [0, -42],
      className: "edificio-marker",
    });
  }, []);

  // Convertir puntos GeoPoint a LatLngExpression para Leaflet
  const convertirAreaAPoligono = (area: GeoPoint[]): LatLngExpression[] => {
    return area.map((punto) => [punto.lat, punto.lng]);
  };

  // Colores para las zonas
  const coloresZonas = [
    "#3b82f6", // azul
    "#ef4444", // rojo
    "#10b981", // verde
    "#f59e0b", // ámbar
    "#8b5cf6", // púrpura
    "#ec4899", // rosa
    "#06b6d4", // cyan
    "#f97316", // naranja
  ];

  return (
    <div className="gloval-map-wrapper">
      <div className="gloval-map-header">
        <h2 className="gloval-map-title">{title}</h2>
        {zonasAMostrar.length > 0 && (
          <p className="gloval-map-info">
            Mostrando {zonasAMostrar.length} zona{zonasAMostrar.length !== 1 ? "s" : ""}
          </p>
        )}
      </div>

      <div className="gloval-map-canvas-wrapper">
        <MapContainer
          center={centerCoords}
          zoom={zoomLevel}
          zoomControl={CORDOBA_MAP_CONFIG.zoomControl}
          attributionControl={CORDOBA_MAP_CONFIG.attributionControl}
          maxBounds={customMaxBounds}
          maxBoundsViscosity={CORDOBA_MAP_CONFIG.maxBoundsViscosity}
          minZoom={minZoomLevel}
          className="gloval-map-canvas"
        >
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

          {/* Mostrar borde y oscurecimiento de Córdoba solo para admins */}
          {userRole !== "comercial" && (
            <>
              {/* Oscurecimiento de áreas fuera de Córdoba */}
              <Polygon
                positions={[CORDOBA_OUTER_RING, CORDOBA_HOLE]}
                pathOptions={{
                  color: "transparent",
                  fillColor: "#0f0a0a",
                  fillOpacity: 0.45,
                }}
                interactive={false}
              />

              {/* Borde de Córdoba */}
              <Rectangle
                bounds={CORDOBA_BOUNDS}
                pathOptions={{
                  color: "#dc2626",
                  weight: 3,
                  fillOpacity: 0,
                }}
                interactive={false}
              />
            </>
          )}

          {/* Renderizar zonas */}
          {zonasAMostrar.map((zona, index) => {
            if (!zona.area || zona.area.length === 0) return null;

            const poligono = convertirAreaAPoligono(zona.area);
            const colorZona = coloresZonas[index % coloresZonas.length];

            // Estilos diferentes según el rol
            const isComercialView = userRole === "comercial" && userZonaId === zona.id;
            const pathOptions = isComercialView
              ? {
                  color: "#dc2626",
                  weight: 5,
                  fillColor: "transparent",
                  fillOpacity: 0,
                  dashArray: "5, 5",
                }
              : {
                  color: colorZona,
                  weight: 2,
                  fillColor: colorZona,
                  fillOpacity: 0.25,
                };

            return (
              <Polygon
                key={zona.id}
                positions={poligono}
                pathOptions={pathOptions}
              >
                <Popup>
                  <div className="zona-popup">
                    <h3>{zona.nombre_zona}</h3>
                    <p>ID: {zona.id}</p>
                    {zona.usuarios && zona.usuarios.length > 0 && (
                      <div>
                        <strong>Comerciales:</strong>
                        <ul>
                          {zona.usuarios.map((usuario) => (
                            <li key={usuario.id}>
                              {usuario.nombre} {usuario.apellidos}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {zona.edificios && zona.edificios.length > 0 && (
                      <p>
                        <strong>Edificios:</strong> {zona.edificios.length}
                      </p>
                    )}
                  </div>
                </Popup>
              </Polygon>
            );
          })}

          {/* Renderizar marcadores de edificios */}
          {edificiosAMostrar.map((edificio) => {
            if (!edificio.ubicacion) return null;

            return (
              <Marker
                key={`edificio-${edificio.id}`}
                position={[edificio.ubicacion.lat, edificio.ubicacion.lng]}
                icon={edificioIcon}
                eventHandlers={{
                  click: () => {
                    if (onEdificioClick) {
                      onEdificioClick(edificio);
                    }
                  },
                }}
              >
                
              </Marker>
            );
          })}
        </MapContainer>
      </div>
    </div>
  );
};

export default GlovalMap;