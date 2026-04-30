import { useState } from "react";
import { MapContainer, TileLayer, Marker, Polygon, Rectangle, useMapEvent } from "react-leaflet";
import { X, MapPin, Trash2, RotateCcw } from "lucide-react";
import L from "leaflet";
import type { GeoPoint, ZonaInput } from "../../../types";
import {
  CORDOBA_BOUNDS,
  CORDOBA_CENTER,
  CORDOBA_OUTER_RING,
  CORDOBA_HOLE,
  isPuntoDentroCordoba,
  getCentroPoligono,
  CORDOBA_MAP_CONFIG,
} from "../../utils/cordobaMapConfig";
import "../../../styles/components/Zona/FormularioModal/ZonaFormularioModal.css";
import { showInfoAlert } from "../../utils/errorHandler";

interface ZonaFormularioModalProps {
  show: boolean;
  loading: boolean;
  mode?: "create" | "edit";
  initialValues?: {
    nombre: string;
    area: GeoPoint[];
  };
  onClose: () => void;
  onSubmit: (zona: ZonaInput) => Promise<void>;
}

// Componente auxiliar para capturar clics en el mapa
const MapClickHandler = ({
  onMapClick,
}: {
  onMapClick: (lat: number, lng: number) => void;
}) => {
  useMapEvent("click", (e) => {
    onMapClick(e.latlng.lat, e.latlng.lng);
  });
  return null;
};

const ZonaFormularioModal = ({
  show,
  loading,
  mode = "create",
  initialValues,
  onClose,
  onSubmit,
}: ZonaFormularioModalProps) => {
  // --- ESTADOS DEL FORMULARIO ---
  const [nombreZona, setNombreZona] = useState("");
  const [puntos, setPuntos] = useState<GeoPoint[]>([]);
  const [mapCenter, setMapCenter] = useState<[number, number]>(CORDOBA_CENTER as [number, number]);

  // --- ESTADOS DE SINCRONIZACIÓN (PARA EVITAR CASCADING RENDERS) ---
  const [prevShow, setPrevShow] = useState(show);
  const [prevInitialValues, setPrevInitialValues] = useState(initialValues);

  // === SOLUCIÓN: Sincronización durante el renderizado (React 18 Standard) ===
  // Si el modal cambia de estado (abrir/cerrar) o cambian los valores iniciales (editar otro registro)
  if (show !== prevShow || initialValues !== prevInitialValues) {
    setPrevShow(show);
    setPrevInitialValues(initialValues);

    if (show) {
      // Al abrir el modal, inicializamos los estados
      const nuevoNombre = initialValues?.nombre ?? "";
      const nuevosPuntos = initialValues?.area ?? [];
      
      setNombreZona(nuevoNombre);
      setPuntos(nuevosPuntos);

      if (nuevosPuntos.length > 0) {
        setMapCenter(getCentroPoligono(nuevosPuntos) as [number, number]);
      } else {
        setMapCenter(CORDOBA_CENTER as [number, number]);
      }
    }
  }

  // --- MANEJADORES DE EVENTOS ---
  const handleMapClick = (lat: number, lng: number) => {
    if (!isPuntoDentroCordoba(lat, lng)) {
      showInfoAlert("Solo puedes seleccionar puntos dentro de Córdoba");
      return;
    }
    setPuntos([...puntos, { lat, lng }]);
  };

  const handleRemovePunto = (index: number) => {
    setPuntos(puntos.filter((_, i) => i !== index));
  };

  const handleClearPuntos = () => {
    setPuntos([]);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!nombreZona.trim()) {
      showInfoAlert("Por favor ingresa un nombre para la zona");
      return;
    }

    if (puntos.length < 3) {
      showInfoAlert("Debes seleccionar mínimo 3 puntos para crear un polígono");
      return;
    }

    try {
      await onSubmit({
        nombre: nombreZona.trim(),
        area: puntos,
      });

      // Limpiamos después del éxito
      setNombreZona("");
      setPuntos([]);
    } catch (error) {
      console.error("Error al guardar zona:", error);
    }
  };

  // --- VARIABLES DERIVADAS ---
  const isValid = nombreZona.trim().length > 0 && puntos.length >= 3;
  const polygonCoordinates = puntos.map((p) => [p.lat, p.lng] as [number, number]);

  if (!show) return null;

  return (
    <div className="zona-modal-overlay" onClick={onClose}>
      <div
        className="zona-modal-container"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="zona-modal-header">
          <h2 className="zona-modal-title">
            {mode === "edit" ? "Editar Zona" : "Crear Nueva Zona"}
          </h2>
          <button
            type="button"
            className="zona-modal-close"
            onClick={onClose}
            disabled={loading}
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="zona-formulario">
          {/* Nombre de la Zona */}
          <div className="zona-formulario-section">
            <label htmlFor="nombreZona" className="zona-label">
              Nombre de la Zona <span className="zona-required">*</span>
            </label>
            <input
              id="nombreZona"
              type="text"
              className="zona-input"
              placeholder="Ej: Centro Histórico, Zona Comercial, etc."
              value={nombreZona}
              maxLength={50}
              onChange={(e) => setNombreZona(e.target.value)}
              disabled={loading}
            />
            <div style={{ textAlign: 'right', fontSize: '11px', color: '#b98989', marginTop: '4px' }}>
              {nombreZona.length} / 50
            </div>
          </div>

          {/* Mapa */}
          <div className="zona-formulario-section">
            <label className="zona-label">
              Dibuja el Área en el Mapa <span className="zona-required">*</span>
            </label>
            <p className="zona-hint">
              Haz clic en el mapa para añadir puntos. Mínimo 3 puntos para un polígono.
            </p>

            <div className="zona-mapa-container">
              <MapContainer
                center={mapCenter}
                zoom={CORDOBA_MAP_CONFIG.zoom}
                zoomControl={CORDOBA_MAP_CONFIG.zoomControl}
                attributionControl={CORDOBA_MAP_CONFIG.attributionControl}
                className="zona-mapa"
                maxBounds={CORDOBA_MAP_CONFIG.maxBounds}
                maxBoundsViscosity={CORDOBA_MAP_CONFIG.maxBoundsViscosity}
                minZoom={CORDOBA_MAP_CONFIG.minZoom}
              >
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

                {/* Filtro de oscuridad fuera de Córdoba */}
                <Polygon
                  positions={[CORDOBA_OUTER_RING, CORDOBA_HOLE]}
                  pathOptions={{
                    color: "transparent",
                    fillColor: "#0f0a0a",
                    fillOpacity: 0.45,
                  }}
                  interactive={false}
                />

                {/* Línea de límite de Córdoba */}
                <Rectangle
                  bounds={CORDOBA_BOUNDS}
                  pathOptions={{
                    color: "#dc2626",
                    weight: 3,
                    fillOpacity: 0,
                  }}
                  interactive={false}
                />

                {/* Dibujo del polígono actual */}
                {puntos.length >= 3 && (
                  <Polygon
                    positions={[polygonCoordinates]}
                    pathOptions={{
                      color: "#3b82f6",
                      fillColor: "#3b82f6",
                      fillOpacity: 0.2,
                      weight: 2,
                    }}
                  />
                )}

                {/* Marcadores de puntos numerados */}
                {puntos.map((punto, index) => (
                  <Marker
                    key={`${punto.lat}-${punto.lng}-${index}`}
                    position={[punto.lat, punto.lng]}
                    icon={L.divIcon({
                      html: `<div class="zona-punto-marker"><span>${index + 1}</span></div>`,
                      className: "zona-custom-marker",
                      iconSize: [32, 32],
                      iconAnchor: [16, 16],
                    })}
                  />
                ))}

                <MapClickHandler onMapClick={handleMapClick} />
              </MapContainer>
            </div>
          </div>

          {/* Lista de Puntos */}
          <div className="zona-formulario-section">
            <div className="zona-puntos-header">
              <label className="zona-label">Puntos ({puntos.length})</label>
              {puntos.length > 0 && (
                <button type="button" className="zona-btn-limpiar" onClick={handleClearPuntos} disabled={loading}>
                  <RotateCcw size={14} /> Limpiar
                </button>
              )}
            </div>

            {puntos.length === 0 ? (
              <div className="zona-puntos-empty">
                <MapPin size={32} />
                <p>Haz clic en el mapa para empezar</p>
              </div>
            ) : (
              <div className="zona-puntos-list">
                {puntos.map((punto, index) => (
                  <div key={`${punto.lat}-${punto.lng}-${index}`} className="zona-punto-item">
                    <div className="zona-punto-info">
                      <span className="zona-punto-numero">{index + 1}</span>
                      <div className="zona-punto-coords">
                        <p className="zona-punto-coord"><strong>Lat:</strong> {punto.lat.toFixed(6)}</p>
                        <p className="zona-punto-coord"><strong>Lng:</strong> {punto.lng.toFixed(6)}</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      className="zona-btn-eliminar-punto"
                      onClick={() => handleRemovePunto(index)}
                      disabled={loading}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Acciones */}
          <div className="zona-formulario-acciones">
            <button type="button" className="zona-btn-cancelar" onClick={onClose} disabled={loading}>
              Cancelar
            </button>
            <button type="submit" className="zona-btn-enviar" disabled={!isValid || loading}>
              {loading ? "Procesando..." : mode === "edit" ? "Guardar Cambios" : "Crear Zona"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ZonaFormularioModal;