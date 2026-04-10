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

  // Crear icono personalizado para edificios con número de clientes
  const createEdificioIcon = (clientesCount = 0) => {
    const label = clientesCount > 99 ? "99+" : String(clientesCount);

    return L.divIcon({
      html: `
        <div class="edificio-pin-icon">
          <span>${label}</span>
          <div class="edificio-pin-tail"></div>
        </div>
      `,
      className: "edificio-pin-marker",
      iconSize: [40, 46],
      iconAnchor: [20, 46],
      popupAnchor: [0, -42],
    });
  };

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
        {zonasAMostrar.length > 0 && userRole !== "comercial" && (
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

            // Obtener el conteo de clientes - puede ser array o objeto con count
            let clientesCount = 0;
            if (Array.isArray(edificio.clientes)) {
              clientesCount = edificio.clientes.length;
            } else if (edificio.clientes && typeof edificio.clientes === 'object' && 'count' in edificio.clientes) {
              clientesCount = edificio.clientes.count;
            }

            return (
              <Marker
                key={`edificio-${edificio.id}`}
                position={[edificio.ubicacion.lat, edificio.ubicacion.lng]}
                icon={createEdificioIcon(clientesCount)}
                eventHandlers={{
                  click: () => {
                    if (onEdificioClick) {
                      onEdificioClick(edificio);
                    }
                  },
                }}
              />
            );
          })}
        </MapContainer>
      </div>
    </div>
  );
};

export default GlovalMap;