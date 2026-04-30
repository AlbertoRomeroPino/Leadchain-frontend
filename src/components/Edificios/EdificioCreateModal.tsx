import React, { useEffect, useState, useCallback, memo } from "react";
import type {
  EdificioInput,
  Edificio,
  EdificioClienteBlock,
  Zona,
  Cliente,
} from "../../types";
import "../../styles/components/Edificios/EdificioCreateModal.css";
import EdificioModalPestaña from "./FormularioModal/EdificioModalPestaña";
import EdificioModalEdificio from "./FormularioModal/EdificioModalEdificio";
import EdificioModalMapa from "./FormularioModal/EdificioModalMapa";
import EdificioModalCliente from "./FormularioModal/EdificioModalCliente";
import { ClientesService } from "../../services/ClientesService";
import {
  showErrorAlert,
  showInfoAlert,
  showSuccessAlert,
} from "../utils/errorHandler";

interface EdificioCreateModalProps {
  show: boolean;
  loading: boolean;
  zonas: Zona[];
  edificios: Edificio[];
  onClose: () => void;
  onCreateEdificio: (payload: EdificioInput) => Promise<Edificio>;
  onAppendMultipleClientes: (
    edificioId: number,
    clientes: EdificioClienteBlock[],
  ) => Promise<void>;
  edificioAEditar?: Edificio;
  onUpdateEdificio?: (id: number, payload: EdificioInput) => Promise<void>;
}

const EdificioCreateModal = memo(({
  show,
  loading,
  zonas,
  edificios,
  onClose,
  onCreateEdificio,
  onAppendMultipleClientes,
  edificioAEditar,
  onUpdateEdificio,
}: EdificioCreateModalProps) => {
  // --- ESTADOS DEL FORMULARIO ---
  const [idCargado, setIdCargado] = useState<number | null | "nuevo">(null);
  const [mode, setMode] = useState<"new" | "existing">("new");
  const [direccionCompleta, setDireccionCompleta] = useState("");
  const [tipo, setTipo] = useState("");
  const [idZona, setIdZona] = useState<number>(zonas?.[0]?.id ?? 0);
  const [lat, setLat] = useState<number | null>(null);
  const [lng, setLng] = useState<number | null>(null);
  const [idCliente, setIdCliente] = useState<number | null>(null);
  const [clientePlanta, setClientePlanta] = useState("");
  const [clientePuerta, setClientePuerta] = useState("");

  const [existingEdificioId, setExistingEdificioId] = useState<number | "">("");
  const [clientes, setClientes] = useState<EdificioClienteBlock[]>([]);
  const [clientesSinEdificio, setClientesSinEdificio] = useState<Cliente[]>([]);

  // --- ESTADOS DE CONTROL ---
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [prevShow, setPrevShow] = useState(show);
  const [prevEdificio, setPrevEdificio] = useState(edificioAEditar);

  // === SINCRONIZACIÓN DE DATOS (EDICIÓN / CREACIÓN) ===
  // Usamos el patrón de derivación para evitar el error de cascading renders de React 18
  if (show !== prevShow || edificioAEditar !== prevEdificio) {
    setPrevShow(show);
    setPrevEdificio(edificioAEditar);

    if (show) {
      setMode("new");
      setIsSubmitting(false); 
      if (edificioAEditar) {
        // Rellenar con datos existentes para EDITAR
        setDireccionCompleta(edificioAEditar.direccion_completa || "");
        setTipo(edificioAEditar.tipo || "");
        setIdZona(edificioAEditar.id_zona);
        setLat(edificioAEditar.ubicacion?.lat ?? null);
        setLng(edificioAEditar.ubicacion?.lng ?? null);
      } else {
        // Limpiar para CREAR nuevo
        setDireccionCompleta("");
        setTipo("");
        setIdZona(zonas?.[0]?.id ?? 0);
        setLat(null);
        setLng(null);
      }
      // Reseteos comunes
      setIdCliente(null);
      setClientePlanta("");
      setClientePuerta("");
      setExistingEdificioId("");
      setClientes([]);
    }
  }

  if (show) {
    const idActual = edificioAEditar?.id ?? "nuevo";

    if (idCargado !== idActual) {
      // Marcamos que ya estamos procesando este ID para que no se repita el bucle
      setIdCargado(idActual);
      setIsSubmitting(false);

      if (edificioAEditar) {
        // MODO EDICIÓN: Rellenamos con los datos del edificio que llega
        setDireccionCompleta(edificioAEditar.direccion_completa || "");
        setTipo(edificioAEditar.tipo || "");
        setIdZona(edificioAEditar.id_zona);
        setLat(edificioAEditar.ubicacion?.lat ?? null);
        setLng(edificioAEditar.ubicacion?.lng ?? null);
        setMode("new"); 
      } else {
        // MODO CREACIÓN: Limpiamos todo
        setDireccionCompleta("");
        setTipo("");
        setIdZona(zonas?.[0]?.id ?? 0);
        setLat(null);
        setLng(null);
        setMode("new");
      }
      
      // Reseteos de limpieza comunes
      setIdCliente(null);
      setClientePlanta("");
      setClientePuerta("");
      setExistingEdificioId("");
      setClientes([]);
    }
  } else if (idCargado !== null) {
    // Si el modal se cierra, reseteamos el ID cargado para que la próxima vez detecte el cambio
    setIdCargado(null);
  }

  // --- HANDLERS ESTABILIZADOS ---
  const handleModeChange = useCallback((newMode: "new" | "existing") => {
    setMode(newMode);
    if (newMode === "existing") setClientes([]);
  }, []);

  const handleZonaChange = useCallback((zonaId: number) => {
    setIdZona(zonaId);
    setLat(null);
    setLng(null);
    setIdCliente(null);
    setClientePlanta("");
    setClientePuerta("");
  }, []);

  // Cargar clientes externos solo si es necesario
  useEffect(() => {
    if (!show || mode !== "existing") return;
    const cargarData = async () => {
      try {
        const data = await ClientesService.getClientesSinEdificio();
        setClientesSinEdificio(data);
      } catch (error) {
        setClientesSinEdificio([]);
      }
    };
    cargarData();
  }, [show, mode]);

  // --- ENVÍO DEL FORMULARIO ---
  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    // BLOQUEO CRÍTICO: Evita múltiples clics y duplicados en BD
    if (loading || isSubmitting) return;

    if (mode === "new") {
      if (!direccionCompleta.trim()) return showInfoAlert("Dirección es obligatoria.");
      if (!tipo.trim()) return showInfoAlert("Tipo es obligatorio.");
      if (!idZona || idZona <= 0) return showInfoAlert("Selecciona una zona.");
      if (lat == null || lng == null) return showInfoAlert("Selecciona ubicación en el mapa.");

      try {
        setIsSubmitting(true);

        if (edificioAEditar) {
          // MODO EDICIÓN
          if (onUpdateEdificio) {
            await onUpdateEdificio(edificioAEditar.id, {
              direccion_completa: direccionCompleta.trim(),
              tipo: tipo.trim(),
              id_zona: idZona,
              ubicacion: { lat, lng },
            });
            showSuccessAlert("Edificio actualizado");
          }
        } else {
          // MODO CREACIÓN
          const nuevo = await onCreateEdificio({
            direccion_completa: direccionCompleta.trim(),
            tipo: tipo.trim(),
            id_zona: idZona,
            ubicacion: { lat, lng },
          });

          if (idCliente && idCliente > 0) {
            await onAppendMultipleClientes(nuevo.id, [{
              id: Math.random().toString(36).substring(2, 11),
              mode: "seleccionar",
              nombre: "", apellidos: "", email: "", telefono: "",
              clienteSinEdificioId: idCliente,
              planta: clientePlanta.trim(),
              puerta: clientePuerta.trim(),
            }]);
          }
          showSuccessAlert("Edificio creado");
        }
        onClose();
      } catch (err) {
        setIsSubmitting(false);
        showErrorAlert(err instanceof Error ? err.message : "Error en el servidor");
      }
    } else {
      // MODO EXISTENTE
      if (existingEdificioId === "") return showInfoAlert("Selecciona un edificio.");
      if (clientes.length === 0) return showInfoAlert("Agrega al menos un cliente.");

      try {
        setIsSubmitting(true);
        await onAppendMultipleClientes(existingEdificioId as number, clientes);
        showSuccessAlert("Clientes añadidos");
        onClose();
      } catch (error) {
        setIsSubmitting(false);
        showErrorAlert("Error al procesar clientes.");
      }
    }
  };

  if (!show) return null;

  const isButtonDisabled = loading || isSubmitting;

  return (
    <div className="edificios-modal-overlay" onClick={onClose}>
      <div className="edificios-modal" onClick={(e) => e.stopPropagation()}>
        
        {!edificioAEditar && <EdificioModalPestaña mode={mode} setMode={handleModeChange} />}

        <form className="form-edificios" onSubmit={handleSubmit}>
          {mode === "new" ? (
            <>
              <h2 className="form-edificio-title">
                {edificioAEditar ? "Actualizar edificio" : "Crear edificio"}
              </h2>
              <EdificioModalEdificio
                direccionCompleta={direccionCompleta}
                setDireccionCompleta={setDireccionCompleta}
                tipo={tipo}
                setTipo={setTipo}
                idZona={idZona}
                setIdZona={handleZonaChange}
                idCliente={idCliente}
                setIdCliente={setIdCliente}
                zonas={zonas}
                clientePlanta={clientePlanta}
                setClientePlanta={setClientePlanta}
                clientePuerta={clientePuerta}
                setClientePuerta={setClientePuerta}
                isEditing={!!edificioAEditar}
              />
              <EdificioModalMapa
                idZona={idZona}
                zonas={zonas}
                lat={lat}
                lng={lng}
                setLat={setLat}
                setLng={setLng}
              />
            </>
          ) : (
            <EdificioModalCliente
              existingEdificioId={existingEdificioId}
              setExistingEdificioId={setExistingEdificioId}
              clientesSinEdificio={clientesSinEdificio}
              edificios={edificios}
              clientes={clientes}
              setClientes={setClientes}
            />
          )}

          <div className="form-edificio-actions">
            <button
              className="form-edificio-cancel"
              type="button"
              onClick={onClose}
              disabled={isButtonDisabled}
            >
              Cancelar
            </button>
            <button
              className="form-edificio-submit"
              type="submit"
              disabled={isButtonDisabled}
            >
              {isButtonDisabled
                ? "Procesando..."
                : edificioAEditar
                ? "Actualizar edificio"
                : mode === "new"
                ? "Crear edificio"
                : "Añadir cliente"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
});

EdificioCreateModal.displayName = "EdificioCreateModal";

export default EdificioCreateModal;