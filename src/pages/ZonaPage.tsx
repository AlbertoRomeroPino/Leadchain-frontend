import { useMemo, useState } from "react";
import { MapContainer, Marker, Popup, Polygon, Rectangle, TileLayer } from "react-leaflet";
import { MapPlus, Pencil, MapMinus } from "lucide-react";
import L from "leaflet";
import Sidebar from "../layout/Sidebar";
import type { Zona } from "../types/zonas/Zona";
import type { Edificio } from "../types/edificios/Edificio";
import type { Cliente } from "../types/clientes/Cliente";
import type { GeoPoint } from "../types/shared/GeoPoint";
import { ZonaService } from "../services/ZonaService";
import { useInitialize } from "../hooks/useInitialize";
import ZonaFormularioModal from "../components/Zona/FormularioModal/ZonaFormularioModal";
import {
  CORDOBA_BOUNDS,
  CORDOBA_CENTER,
  CORDOBA_OUTER_RING,
  CORDOBA_HOLE,
  CORDOBA_MAP_CONFIG,
} from "../components/utils/cordobaMapConfig";
import "leaflet/dist/leaflet.css";
import "../styles/ZonaPage.css";

const Zona = () => {
  const [zonas, setZonas] = useState<Zona[]>([]);
  const [selectedZona, setSelectedZona] = useState<Zona | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [creatingZona, setCreatingZona] = useState(false);
  const [editMode, setEditMode] = useState(false);

  // Cargar datos optimizados en una única consulta
  useInitialize(async () => {
    try {
      const zonasResponse = await ZonaService.getZonasPageData();
      setZonas(zonasResponse);
    } catch (error) {
      console.error("Error fetching zonas:", error);
    }
  });

  const handleCreateZona = async (zona: { nombre_zona: string; area: GeoPoint[] }) => {
    try {
      setCreatingZona(true);
      await ZonaService.createZona(zona);
      const zonasResponse = await ZonaService.getZonasPageData();
      setZonas(zonasResponse);
      setShowCreateForm(false);
      setEditMode(false);
    } catch (error) {
      // Error al crear zona
    } finally {
      setCreatingZona(false);
    }
  };

  const handleUpdateZona = async (zona: { nombre_zona: string; area: GeoPoint[] }) => {
    if (!selectedZona) return;
    try {
      setCreatingZona(true);
      await ZonaService.updateZona(selectedZona.id, zona);
      const zonasResponse = await ZonaService.getZonasPageData();
      setZonas(zonasResponse);
      const updatedZona = zonasResponse.find((z: Zona) => z.id === selectedZona.id);
      if (updatedZona) setSelectedZona(updatedZona);
      setShowCreateForm(false);
      setEditMode(false);
    } catch (error) {
      // Error al actualizar zona
    } finally {
      setCreatingZona(false);
    }
  };

  const handleFormSubmit = async (zona: { nombre_zona: string; area: GeoPoint[] }) => {
    if (editMode && selectedZona) {
      await handleUpdateZona(zona);
    } else {
      await handleCreateZona(zona);
    }
  };

  const handleOpenCreate = () => {
    setEditMode(false);
    setShowCreateForm(true);
  };

  const handleOpenEdit = () => {
    setEditMode(true);
    setShowCreateForm(true);
  };

  const handleCloseForm = () => {
    setShowCreateForm(false);
    setEditMode(false);
  };

  const handleDeleteZona = async () => {
    if (!selectedZona) return;
    if (
      window.confirm(
        `¿Estás seguro de que deseas eliminar la zona "${selectedZona.nombre_zona}"? Esta acción eliminará todos los edificios y datos asociados.`
      )
    ) {
      try {
        setCreatingZona(true);
        await ZonaService.deleteZona(selectedZona.id);
        const zonasResponse = await ZonaService.getZonasPageData();
        setZonas(zonasResponse);
        setSelectedZona(null);
      } catch (error) {
        // Error al eliminar zona
      } finally {
        setCreatingZona(false);
      }
    }
  };

  // Obtener edificios de la zona seleccionada (ahora vienen dentro de la zona)
  const selectedEdificios = useMemo(() => {
    if (!selectedZona || !selectedZona.edificios) return [];
    return selectedZona.edificios;
  }, [selectedZona]);

  // Calcular edificios con clientes asignados
  const selectedAssignedEdificios = useMemo(() => {
    return selectedEdificios.filter((edificio) => Array.isArray(edificio.clientes) && edificio.clientes.length > 0);
  }, [selectedEdificios]);

  // Contar edificios por zona
  const edificiosPorZona = useMemo(() => {
    const counts: Record<number, number> = {};
    zonas.forEach((zona) => {
      if (zona.edificios) {
        counts[zona.id] = zona.edificios.length;
      }
    });
    return counts;
  }, [zonas]);

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
      if (Array.isArray(edificio.clientes) && edificio.clientes.length > 0) {
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
        <div className="zona-header">
          <div>
            <h1 className="clientes-title">Zonas</h1>
            <p className="clientes-subtitle">
              Gestión y visualización de áreas de trabajo en el mapa
            </p>
          </div>
          <button
            className="zona-create-button"
            onClick={handleOpenCreate}
            disabled={creatingZona}
          >
            <MapPlus size={16} />
            Crear
          </button>
        </div>

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
            <div className="zona-details-header">
              <h2 className="zona-section-title">
                {`Zona seleccionada: ${selectedZona.nombre_zona} (ID ${selectedZona.id})`}
              </h2>
              <div className="zona-action-buttons">
                <button
                  className="zona-action-button zona-action-button--edit"
                  onClick={handleOpenEdit}
                  disabled={creatingZona}
                >
                  <Pencil size={16} />
                  Editar
                </button>
                <button
                  className="zona-action-button zona-action-button--delete"
                  onClick={handleDeleteZona}
                  disabled={creatingZona}
                >
                  <MapMinus size={16} />
                  Borrar
                </button>
              </div>
            </div>

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
                    ? (polygonCoordinates[0] as [number, number])
                    : (CORDOBA_CENTER as [number, number])
                }
                {...CORDOBA_MAP_CONFIG}
              >
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

                {/* Polígono que oscurece todo excepto Córdoba */}
                <Polygon
                  positions={[CORDOBA_OUTER_RING, CORDOBA_HOLE]}
                  pathOptions={{
                    color: "transparent",
                    fillColor: "#0f0a0a",
                    fillOpacity: 0.45,
                  }}
                  interactive={false}
                />

                {/* Rectángulo que delimita Córdoba */}
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
                  // Crear un array de clientes con sus edificios asociados
                  const clientesConEdificio = cluster.edificios.flatMap((ed) =>
                    Array.isArray(ed.clientes) && ed.clientes.length > 0
                      ? ed.clientes.map((cliente: Cliente & { planta?: string | null; puerta?: string | null }) => ({
                          cliente,
                          edificio: ed,
                        }))
                      : []
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
                            {cluster.edificios[0]?.direccion_completa ??
                              "Dirección no disponible"}
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
                                    {item.cliente.nombre} {item.cliente.apellidos}
                                  </p>
                                  <p className="popup-client-details">
                                    Piso: {item.cliente.planta ?? "N/A"} • Puerta:{" "}
                                    {item.cliente.puerta ?? "N/A"}
                                    <br />
                                    Tel: {item.cliente.telefono ?? "N/A"}
                                  </p>
                                </div>
                              </div>
                            ))}
                            {clientesConEdificio.length > 15 && (
                              <p className="popup-footer">
                                Mostrando 15 de {clientesConEdificio.length}{" "}
                                clientes
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
          </section>
        )}


        <ZonaFormularioModal
          show={showCreateForm}
          loading={creatingZona}
          mode={editMode ? "edit" : "create"}
          initialValues={
            editMode && selectedZona
              ? {
                  nombre_zona: selectedZona.nombre_zona,
                  area: selectedZona.area ?? [],
                }
              : undefined
          }
          onClose={handleCloseForm}
          onSubmit={handleFormSubmit}
        />
      </main>
    </div>
  );
};

export default Zona;
