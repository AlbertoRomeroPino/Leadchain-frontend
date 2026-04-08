import { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Polygon, Rectangle, useMapEvent } from "react-leaflet";
import { X, MapPin, Trash2, RotateCcw, Eye, EyeOff } from "lucide-react";
import L from "leaflet";
import type { GeoPoint } from "../../../types/shared/GeoPoint";
import type { ZonaInput } from "../../../types/zonas/Zona";
import {
  CORDOBA_BOUNDS,
  CORDOBA_CENTER,
  CORDOBA_OUTER_RING,
  CORDOBA_HOLE,
  isPuntoDentroCordoba,
  getCentroPoligono,
  CORDOBA_MAP_CONFIG,
} from "../../utils/cordobaMapConfig";
import "../../../styles/ZonaFormularioModal.css";

interface ZonaFormularioModalProps {
  show: boolean;
  loading: boolean;
  mode?: "create" | "edit";
  initialValues?: {
    nombre_zona: string;
    area: GeoPoint[];
  };
  onClose: () => void;
  onSubmit: (zona: ZonaInput) => Promise<void>;
}

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
  const [nombreZona, setNombreZona] = useState(initialValues?.nombre_zona ?? "");
  const [puntos, setPuntos] = useState<GeoPoint[]>(initialValues?.area ?? []);
  const [mapCenter, setMapCenter] = useState<[number, number]>(
    CORDOBA_CENTER as [number, number]
  );
  const [testMode, setTestMode] = useState(false);

  useEffect(() => {
    if (initialValues?.nombre_zona) {
      setNombreZona(initialValues.nombre_zona);
    }
    if (initialValues?.area && initialValues.area.length > 0) {
      setPuntos(initialValues.area);
      setMapCenter(getCentroPoligono(initialValues.area) as [number, number]);
    }
  }, [initialValues, show]);

  const handleMapClick = (lat: number, lng: number) => {
    // Validar que el punto está dentro de Córdoba
    if (!isPuntoDentroCordoba(lat, lng)) {
      alert("❌ Solo puedes seleccionar puntos dentro de Córdoba");
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
      alert("Por favor ingresa un nombre para la zona");
      return;
    }

    if (puntos.length < 3) {
      alert("Debes seleccionar mínimo 3 puntos para crear un polígono");
      return;
    }
// Si está en modo test, solo muestra el resultado sin enviar
    if (testMode) {
      alert(
        `MODO TEST - No se guardará\n\nZona: ${nombreZona}\nPuntos: ${puntos.length}\nÁrea válida: ✓`
      );
      return;
    }

    
    try {
      await onSubmit({
        nombre_zona: nombreZona.trim(),
        area: puntos,
      });

      // Limpiar formulario después de envío exitoso
      setNombreZona("");
      setPuntos([]);
      setMapCenter(CORDOBA_CENTER as [number, number]);
    } catch (error) {
      console.error("Error al guardar zona:", error);
    }
  };

  const isValid = nombreZona.trim().length > 0 && puntos.length >= 3;
  const polygonCoordinates = puntos.map((p) => [p.lat, p.lng] as [number, number]);

  if (!show) {
    return null;
  }

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
          {/* Sección: Nombre de la Zona */}
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
              onChange={(e) => setNombreZona(e.target.value)}
              disabled={loading}
            />
          </div>

          {/* Sección: Mapa */}
          <div className="zona-formulario-section">
            <label className="zona-label">
              Dibuja el Área en el Mapa{" "}
              <span className="zona-required">*</span>
            </label>
            <p className="zona-hint">
              Haz clic en el mapa para añadir puntos. Mínimo 3 puntos para crear
              un polígono. Solo puedes seleccionar puntos dentro de Córdoba.
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

                {/* Polígono de la zona */}
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

                {/* Marcadores de puntos */}
                {puntos.map((punto, index) => (
                  <Marker
                    key={`${punto.lat}-${punto.lng}-${index}`}
                    position={[punto.lat, punto.lng]}
                    icon={L.divIcon({
                      html: `<div class="zona-punto-marker"><span>${index + 1}</span></div>`,
                      className: "zona-custom-marker",
                      iconSize: [32, 32],
                      iconAnchor: [16, 16],
                      popupAnchor: [0, -16],
                    })}
                  />
                ))}

                {/* Manejador de clicks */}
                <MapClickHandler onMapClick={handleMapClick} />
              </MapContainer>
            </div>
          </div>

          {/* Sección: Puntos Seleccionados */}
          <div className="zona-formulario-section">
            <div className="zona-puntos-header">
              <label className="zona-label">
                Puntos Seleccionados ({puntos.length})
              </label>
              {puntos.length > 0 && (
                <button
                  type="button"
                  className="zona-btn-limpiar"
                  onClick={handleClearPuntos}
                  disabled={loading}
                >
                  <RotateCcw size={14} />
                  Limpiar
                </button>
              )}
            </div>

            {puntos.length === 0 ? (
              <div className="zona-puntos-empty">
                <MapPin size={32} />
                <p>No hay puntos seleccionados</p>
                <p className="zona-hint">Haz clic en el mapa para empezar</p>
              </div>
            ) : (
              <div className="zona-puntos-list">
                {puntos.map((punto, index) => (
                  <div key={`${punto.lat}-${punto.lng}-${index}`} className="zona-punto-item">
                    <div className="zona-punto-info">
                      <span className="zona-punto-numero">{index + 1}</span>
                      <div className="zona-punto-coords">
                        <p className="zona-punto-coord">
                          <strong>Lat:</strong> {punto.lat.toFixed(6)}
                        </p>
                        <p className="zona-punto-coord">
                          <strong>Lng:</strong> {punto.lng.toFixed(6)}
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      className="zona-btn-eliminar-punto"
                      onClick={() => handleRemovePunto(index)}
                      disabled={loading}
                      title="Eliminar punto"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Validación */}
          {puntos.length > 0 && puntos.length < 3 && (
            <div className="zona-validacion-alerta">
              <p>Faltan {3 - puntos.length} punto(s) para crear el polígono</p>
            </div>
          )}

          {/* Botones de acción */}
          <div className="zona-formulario-acciones">
            {testMode && (
              <div className="zona-test-badge">
                <Eye size={14} />
                MODO TEST - No se guardará
              </div>
            )}
            <button
              type="button"
              className={`zona-btn-test ${testMode ? "active" : ""}`}
              onClick={() => setTestMode(!testMode)}
              disabled={loading}
              title={testMode ? "Desactivar modo test" : "Activar modo test"}
            >
              {testMode ? <EyeOff size={14} /> : <Eye size={14} />}
              {testMode ? "Desactivar Test" : "Test"}
            </button>
            <button
              type="button"
              className="zona-btn-cancelar"
              onClick={onClose}
              disabled={loading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="zona-btn-enviar"
              disabled={!isValid || loading}
            >
              {loading
                ? mode === "edit"
                  ? "Guardando..."
                  : "Creando..."
                : mode === "edit"
                  ? "Guardar Cambios"
                  : "Crear Zona"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ZonaFormularioModal;
