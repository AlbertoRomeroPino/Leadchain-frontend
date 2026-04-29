import { MapContainer, Polygon, Rectangle, TileLayer } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import "../../styles/components/utils/GlovalMap.css";
import MapView from "../MapSetup/MapView";
import EdificioMarker from "../MapViews/EdificioMarker";import ZoomCalculator from "../MapSetup/ZoomCalculator";import {
  CORDOBA_BOUNDS,
  CORDOBA_CENTER,
  CORDOBA_MAP_CONFIG,
  CORDOBA_OUTER_RING,
  CORDOBA_HOLE,
} from "./cordobaMapConfig";
import type { Zona, Edificio, GeoPoint } from "../../types";
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
  enableMapBoundsSetup?: boolean;
  mapPaddingPixels?: number;
  mapExpansionFactor?: number;
  enableZoomCalculator?: boolean;
  onZoomCalculated?: (zoom: { minZoom: number; initialZoom: number }) => void;
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
  enableMapBoundsSetup = false,
  mapPaddingPixels = 50,
  mapExpansionFactor = 1.2,
  enableZoomCalculator = false,
  onZoomCalculated,
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

  // Obtener el área de la zona del comercial si aplica
  const comercialZoneArea = useMemo(() => {
    if (userRole === "comercial" && userZonaId && zonas.length > 0) {
      const userZona = zonas.find((zona) => zona.id === userZonaId);
      return userZona?.area ?? null;
    }
    return null;
  }, [userRole, userZonaId, zonas]);

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
          scrollWheelZoom={true}
          zoomControl={false}
          attributionControl={CORDOBA_MAP_CONFIG.attributionControl}
          maxBounds={customMaxBounds}
          maxBoundsViscosity={userRole === "comercial" ? 0.5 : CORDOBA_MAP_CONFIG.maxBoundsViscosity}
          minZoom={minZoomLevel}
          dragging={true}
          touchZoom={true}
          doubleClickZoom={true}
          boxZoom={true}
          className="gloval-map-canvas"
        >
          {/* Configurar vista y restricciones de navegación según el rol */}
          {enableMapBoundsSetup && (
            <MapView
              userRole={userRole}
              zoneArea={comercialZoneArea}
              paddingPixels={mapPaddingPixels}
              expansionFactor={mapExpansionFactor}
            />
          )}

          {/* Calcular zoom automáticamente basado en los bounds de la zona */}
          {enableZoomCalculator && (
            <ZoomCalculator
              zoneArea={comercialZoneArea}
              onZoomCalculated={onZoomCalculated}
            />
          )}

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
          {zonasConConteo.map(({ zona }, index) => {
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

            const edificioZona = zonasAMostrar.find((zona) => zona.id === edificio.id_zona);

            return (
              <EdificioMarker
                key={`edificio-${edificio.id}`}
                edificio={edificio}
                zona={edificioZona}
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