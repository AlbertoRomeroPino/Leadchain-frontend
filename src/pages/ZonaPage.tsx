import { useEffect, useMemo, useState } from "react";
import { MapContainer, Marker, Popup, Polygon, TileLayer } from "react-leaflet";
import L from "leaflet";
import Sidebar from "../layout/Sidebar";
import type { Zona } from "../types/zonas/Zona";
import type { Edificio } from "../types/edificios/Edificio";
import { ZonaService } from "../services/ZonaService";
import { EdificioService } from "../services/EdificiosService";
import { clientesService } from "../services/ClientesService";
import "leaflet/dist/leaflet.css";
import "../styles/ZonaPage.css";

const Zona = () => {
  const [zonas, setZonas] = useState<Zona[]>([]);
  const [edificios, setEdificios] = useState<Edificio[]>([]);
  const [clientes, setClientes] = useState<
    Record<
      number,
      { nombre: string; apellidos: string; telefono: string | null }
    >
  >({});
  const [selectedZona, setSelectedZona] = useState<Zona | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const zonasResponse = await ZonaService.getZonas();
        const edificiosResponse = await EdificioService.getEdificios();
        const clientesResponse = await clientesService.getClientes();

        setZonas(zonasResponse);
        setEdificios(edificiosResponse);
        setClientes(
          clientesResponse.reduce(
            (acc, cliente) => {
              acc[cliente.id] = cliente;
              return acc;
            },
            {} as Record<
              number,
              { nombre: string; apellidos: string; telefono: string | null }
            >,
          ),
        );
      } catch (error) {
        console.error("Error fetching zonas, edificios o clientes:", error);
      }
    };

    fetchData();
  }, []);

  const edificiosPorZona = useMemo(() => {
    const counts: Record<number, number> = {};
    edificios.forEach((edificio) => {
      if (edificio.id_zona) {
        counts[edificio.id_zona] = (counts[edificio.id_zona] || 0) + 1;
      }
    });
    return counts;
  }, [edificios]);

  const selectedEdificios = useMemo(() => {
    if (!selectedZona) return [];
    return edificios.filter((edificio) => edificio.id_zona === selectedZona.id);
  }, [selectedZona, edificios]);

  const selectedAssignedEdificios = useMemo(() => {
    return selectedEdificios.filter((edificio) => edificio.id_cliente != null);
  }, [selectedEdificios]);

  const clusteredMarkers = useMemo(() => {
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

    selectedEdificios.forEach((edificio) => {
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
      if (edificio.id_cliente != null) {
        clusters[key].assignedClients += 1;
      }
      clusters[key].edificios.push(edificio);
    });

    return Object.values(clusters);
  }, [selectedEdificios]);

  const createClusterIcon = (count: number) => {
    return L.divIcon({
      html: `<div class="cluster-marker"><span>${count}</span></div>`,
      className: "custom-div-icon",
      iconSize: [30, 30],
      iconAnchor: [15, 15],
      popupAnchor: [0, -15],
    });
  };

  const polygonCoordinates = (selectedZona?.area ?? [])
    .map((c) => [c.lat, c.lng])
    .filter(
      (point): point is [number, number] =>
        Array.isArray(point) && point.length === 2,
    );

  return (
    <div className="clientes-page">
      <Sidebar />

      <main className="clientes-main">
        <h1 className="clientes-title">Zonas</h1>
        <p className="clientes-subtitle">
          Gestión y visualización de áreas de trabajo en el mapa
        </p>

        <div className="zona-container">
          <table className="zona-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Nombre de la Zona</th>
                <th>Total Edificios</th>
              </tr>
            </thead>
            <tbody>
              {zonas.map((zona) => (
                <tr
                  key={zona.id}
                  onClick={() => setSelectedZona(zona)}
                  className={selectedZona?.id === zona.id ? "selected" : ""}
                >
                  <td>{zona.id}</td>
                  <td>{zona.nombre_zona}</td>
                  <td>{edificiosPorZona[zona.id] || 0}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {selectedZona && (
          <section className="zona-details-section">
            <h2 className="zona-section-title">
              {`Zona seleccionada: ${selectedZona.nombre_zona} (ID ${selectedZona.id})`}
            </h2>

            <div className="zona-stats">
              <div className="zona-stat-item">
                Edificios en zona: <strong>{selectedEdificios.length}</strong>
              </div>
              <div className="zona-stat-item">
                Clientes asignados:{" "}
                <strong>{selectedAssignedEdificios.length}</strong>
              </div>
            </div>

            <div className="map-wrapper">
              <MapContainer
                className="map-container-inner"
                center={
                  polygonCoordinates.length
                    ? polygonCoordinates[0]
                    : [37.8847, -4.7792]
                }
                zoom={14}
              >
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

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

                {clusteredMarkers.map((cluster, index) => (
                  <Marker
                    key={`${cluster.lat}_${cluster.lng}_${index}`}
                    position={[cluster.lat, cluster.lng]}
                    icon={createClusterIcon(cluster.count)}
                  >
                    <Popup className="custom-popup">
                      <div className="popup-content">
                        <p className="popup-address">
                          {cluster.edificios[0]?.direccion_completa ??
                            "Dirección no disponible"}
                        </p>
                        <p className="popup-info">
                          {cluster.count > 1
                            ? `${cluster.count} clientes en esta ubicación`
                            : "1 cliente en esta ubicación"}
                        </p>
                        <div className="popup-list">
                          {cluster.edificios.slice(0, 10).map((ed) => {
                            const cliente =
                              ed.id_cliente != null
                                ? clientes[Number(ed.id_cliente)]
                                : null;
                            return (
                              <div key={ed.id} className="popup-item">
                                <p className="popup-client-name">
                                  {cliente
                                    ? `${cliente.nombre} ${cliente.apellidos}`
                                    : "Cliente Sin asignar"}
                                </p>
                                <p className="popup-client-details">
                                  Piso: {ed.planta ?? "N/A"} • Puerta:{" "}
                                  {ed.puerta ?? "N/A"}
                                  <br />
                                  Tel: {cliente?.telefono ?? "N/A"}
                                </p>
                              </div>
                            );
                          })}
                          {cluster.edificios.length > 10 && (
                            <p className="popup-footer">
                              Mostrando 10 de {cluster.edificios.length}{" "}
                              clientes
                            </p>
                          )}
                        </div>
                      </div>
                    </Popup>
                  </Marker>
                ))}
              </MapContainer>
            </div>
          </section>
        )}
      </main>
    </div>
  );
};

export default Zona;
