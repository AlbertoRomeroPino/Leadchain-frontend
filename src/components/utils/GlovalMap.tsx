import { MapContainer, Polygon, Rectangle, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import "../../styles/components/utils/GlovalMap.css";
import {
  CORDOBA_BOUNDS,
  CORDOBA_CENTER,
  CORDOBA_MAP_CONFIG,
  CORDOBA_OUTER_RING,
  CORDOBA_HOLE,
} from "./cordobaMapConfig";
import type { Zona } from "../../types/zonas/Zona";
import type { Edificio } from "../../types/edificios/Edificio";
import type { Cliente } from "../../types/clientes/Cliente";
import type { GeoPoint } from "../../types/shared/GeoPoint";
import type { LatLngExpression, LatLngBoundsExpression } from "leaflet";
import { useMemo, memo } from "react";
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
}

// Componente memoizado para cada marcador de edificio
// Esto evita que se re-rendericen todos los edificios cuando cambia algo
interface EdificioMarkerProps {
  edificio: Edificio;
  icon: L.DivIcon;
}

const EdificioMarker = memo(({ edificio, icon }: EdificioMarkerProps) => {
  if (!edificio.ubicacion) return null;

  // Obtener el conteo de clientes - puede ser array u objeto con count
  let clientesCount = 0;
  let clientesArray: (Cliente & { planta?: string | null; puerta?: string | null })[] = [];
  
  if (Array.isArray(edificio.clientes)) {
    clientesCount = edificio.clientes.length;
    clientesArray = edificio.clientes;
  } else if (edificio.clientes && typeof edificio.clientes === 'object' && 'count' in edificio.clientes) {
    clientesCount = (edificio.clientes as { count: number }).count;
  }

  const clientesConEdificio = Array.isArray(edificio.clientes)
    ? edificio.clientes.map((cliente: Cliente & { planta?: string | null; puerta?: string | null }) => ({
        cliente,
        edificio,
      }))
    : [];

  return (
    <Marker
      key={`edificio-${edificio.id}`}
      position={[edificio.ubicacion.lat, edificio.ubicacion.lng]}
      icon={icon}
    >
      <Popup className="custom-popup">
        <div className="popup-content">
          <p className="popup-address">
            {edificio.direccion_completa ?? "Dirección no disponible"}
          </p>
          <p className="popup-info">
            {clientesCount > 0
              ? `${clientesCount} cliente${clientesCount !== 1 ? "s" : ""} en esta ubicación`
              : "Sin clientes asignados"}
          </p>
          <div className="popup-list">
            {clientesConEdificio.slice(0, 15).map((item, idx) => (
              <div
                key={`${item.cliente.id}-${item.edificio.id}-${idx}`}
                className="popup-item"
              >
                <div>
                  <p className="popup-client-name">
                    {item.cliente.nombre} {item.cliente.apellidos}
                  </p>
                  <p className="popup-client-details">
                    Piso: {item.cliente.planta ?? "N/A"} • Puerta: {item.cliente.puerta ?? "N/A"}
                    <br />
                    Tel: {item.cliente.telefono ?? "N/A"}
                  </p>
                </div>
              </div>
            ))}
            {clientesConEdificio.length > 15 && (
              <p className="popup-footer">
                Mostrando 15 de {clientesConEdificio.length} clientes
              </p>
            )}
          </div>
        </div>
      </Popup>
    </Marker>
  );
});

EdificioMarker.displayName = "EdificioMarker";

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
  type EdificioClientesCount = { count: number };

  const isEdificioClientesCount = (
    value: unknown,
  ): value is EdificioClientesCount => {
    return (
      typeof value === "object" &&
      value !== null &&
      "count" in value &&
      typeof (value as Record<string, unknown>).count === "number"
    );
  };

  const createEdificioIcon = useMemo(() => {
    return (clientesCount = 0) => {
      const label = clientesCount > 99 ? "99+" : String(clientesCount);

      return L.divIcon({
        html: `
          <div class="edificio-pin-icon">
            <span>${label}</span>
            <div class="edificio-pin-tail"></div>
          </div>
        `,
        className: "edificio-pin-marker",
        iconSize: [40, 40],
        iconAnchor: [20, 40],
        popupAnchor: [0, -35],
      });
    };
  }, []);

  // Convertir puntos GeoPoint a LatLngExpression para Leaflet
  const convertirAreaAPoligono = (area: GeoPoint[]): LatLngExpression[] => {
    return area.map((punto) => [punto.lat, punto.lng]);
  };

  // Calcular conteo de edificios y clientes por zona
  const zonasConConteo = useMemo(() => {
    return zonasAMostrar.map((zona) => {
      const edificiosCount = zona.edificios?.length ?? 0;
      const clientesCount = zona.edificios?.reduce((total, edificio) => {
        if (!edificio.clientes || edificio.clientes.length === 0) {
          return total;
        }
        return total + edificio.clientes.length;
      }, 0) ?? 0;

      return {
        zona,
        edificiosCount,
        clientesCount,
      };
    });
  }, [zonasAMostrar]);

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
          {zonasConConteo.map(({ zona, edificiosCount, clientesCount }, index) => {
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
                interactive={false}
              />
            );
          })}

          {/* Renderizar marcadores de edificios */}
          {edificiosAMostrar.map((edificio) => {
            if (!edificio.ubicacion) return null;

            let clientesCount = 0;
            if (Array.isArray(edificio.clientes)) {
              clientesCount = edificio.clientes.length;
            } else if (isEdificioClientesCount(edificio.clientes)) {
              clientesCount = edificio.clientes.count;
            }

            return (
              <EdificioMarker
                key={`edificio-${edificio.id}`}
                edificio={edificio}
                icon={createEdificioIcon(clientesCount)}
              />
            );
          })}
        </MapContainer>
      </div>
    </div>
  );
};


export default GlovalMap;