import { MapContainer, Marker, Popup, Polygon, Rectangle, TileLayer, useMap } from "react-leaflet";
import "../../styles/components/Zona/ZonaMap.css";
import type { Zona, Edificio, Cliente } from "../../types";
import { useEffect, useMemo } from "react";
import L from "leaflet";

const MAX_CLIENTE_NOMBRE_LENGTH = 40;

const getNombreCompleto = (cliente: Cliente) => {
  const apellidos = cliente.apellidos?.trim() ?? "";
  const lowerApellidos = apellidos.toLowerCase();
  const nombreCompleto =
    !apellidos || lowerApellidos === "sin apellidos" || lowerApellidos === "sin apellido"
      ? cliente.nombre
      : `${cliente.nombre} ${apellidos}`;

  if (nombreCompleto.length <= MAX_CLIENTE_NOMBRE_LENGTH) return nombreCompleto;

  return `${nombreCompleto.slice(0, MAX_CLIENTE_NOMBRE_LENGTH - 3).trimEnd()}...`;
};
import {
  CORDOBA_BOUNDS,
  CORDOBA_CENTER,
  CORDOBA_MAP_CONFIG,
  CORDOBA_OUTER_RING,
  CORDOBA_HOLE,
} from "../utils/cordobaMapConfig";

interface ZonaMapProps {
  selectedZona: Zona;
}

type Cluster = {
  lat: number;
  lng: number;
  count: number;
  assignedClients: number;
  edificios: Edificio[];
};

const createClusterIcon = (count: number) =>
  L.divIcon({
    html: `<div class="cluster-marker"><span>${count}</span></div>`,
    className: "custom-div-icon",
    iconSize: [30, 30],
    iconAnchor: [15, 15],
    popupAnchor: [0, -15],
  });

const convertirAreaAPoligono = (area: Zona["area"] = []) =>
  (area ?? [])
    .map((punto) => [punto.lat, punto.lng] as [number, number])
    .filter((point) => point.length === 2);

const MapResizeHandler = () => {
  const map = useMap();

  useEffect(() => {
    const resizeMap = () => {
      map.invalidateSize();
    };

    resizeMap();
    window.addEventListener("resize", resizeMap);

    return () => {
      window.removeEventListener("resize", resizeMap);
    };
  }, [map]);

  return null;
};

const ZonaMap = ({ selectedZona }: ZonaMapProps) => {
  const polygonCoordinates = useMemo(
    () => convertirAreaAPoligono(selectedZona.area ?? []),
    [selectedZona.area],
  );

  const clusteredMarkers = useMemo<Cluster[]>(() => {
    const clusters: Record<
      string,
      {
        lat: number;
        lng: number;
        count: number;
        assignedClients: number;
        edificios: Edificio[];
      }
    > = {};

    (selectedZona.edificios ?? []).forEach((edificio) => {
      if (!edificio.ubicacion) return;
      const key = `${edificio.ubicacion.lat.toFixed(6)}_${edificio.ubicacion.lng.toFixed(6)}`;
      if (!clusters[key]) {
        clusters[key] = {
          lat: edificio.ubicacion.lat,
          lng: edificio.ubicacion.lng,
          count: 0,
          assignedClients: 0,
          edificios: [],
        };
      }
      clusters[key].count += 1;
      if (Array.isArray(edificio.clientes) && edificio.clientes.length > 0) {
        clusters[key].assignedClients += 1;
      }
      clusters[key].edificios.push(edificio);
    });

    return Object.values(clusters);
  }, [selectedZona.edificios]);

  return (
    <div className="map-wrapper">
      <MapContainer
        className="map-container-inner"
        center={
          polygonCoordinates.length
            ? polygonCoordinates[0]
            : (CORDOBA_CENTER as [number, number])
        }
        {...CORDOBA_MAP_CONFIG}
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <MapResizeHandler />

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

        {polygonCoordinates.length > 0 && (
          <Polygon
            positions={[polygonCoordinates]}
            pathOptions={{
              color: "#dc2626",
              fillOpacity: 0.15,
              weight: 2,
            }}
          />
        )}

        {clusteredMarkers.map((cluster, index) => {
          const clientesConEdificio = cluster.edificios.flatMap((ed) =>
            Array.isArray(ed.clientes) && ed.clientes.length > 0
              ? ed.clientes.map((cliente: Cliente & { planta?: string | null; puerta?: string | null }) => ({
                  cliente,
                  edificio: ed,
                }))
              : [],
          );

          const totalClientes = clientesConEdificio.length;

          return (
            <Marker
              key={`${cluster.lat}_${cluster.lng}_${index}`}
              position={[cluster.lat, cluster.lng]}
              icon={createClusterIcon(totalClientes)}
            >
              <Popup className="custom-popup">
                <div className="popup-content">
                  <p className="popup-address">
                    {cluster.edificios[0]?.direccion_completa ?? "Dirección no disponible"}
                  </p>
                  <p className="popup-info">
                    {totalClientes > 0
                      ? `${totalClientes} cliente${totalClientes !== 1 ? "s" : ""} en esta ubicación`
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
                            {getNombreCompleto(item.cliente)}
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
        })}
      </MapContainer>
    </div>
  );
};

export default ZonaMap;
