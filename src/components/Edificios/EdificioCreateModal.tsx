import React, { useEffect, useState } from "react";
import type {
  EdificioInput,
  Edificio,
  EdificioClienteBlock,
  Zona,
  Cliente
} from "../../types";
import "../../styles/components/Edificios/EdificioCreateModal.css";
import EdificioModalPestaña from "./FormularioModal/EdificioModalPestaña";
import EdificioModalEdificio from "./FormularioModal/EdificioModalEdificio";
import EdificioModalMapa from "./FormularioModal/EdificioModalMapa";
import EdificioModalCliente from "./FormularioModal/EdificioModalCliente";
import { clientesService } from "../../services/ClientesService";
import { showErrorAlert, showInfoAlert, showSuccessAlert } from "../utils/errorHandler";

interface EdificioCreateModalProps {
  show: boolean;
  loading: boolean;
  zonas: Zona[];
  edificios: Edificio[];
  onClose: () => void;
  onCreateEdificio: (payload: EdificioInput) => Promise<Edificio>;
  onAppendMultipleClientes: (edificioId: number, clientes: EdificioClienteBlock[]) => Promise<void>;
  edificioAEditar?: Edificio;
  onUpdateEdificio?: (id: number, payload: EdificioInput) => Promise<void>;
}

const EdificioCreateModal = ({
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
  const [mode, setMode] = useState<"new" | "existing">("new");
  const [direccionCompleta, setDireccionCompleta] = useState("");
  const [tipo, setTipo] = useState("");
  const [idZona, setIdZona] = useState<number>(zonas?.[0]?.id ?? 0);
  const [lat, setLat] = useState<number | null>(null);
  const [lng, setLng] = useState<number | null>(null);
  const [idCliente, setIdCliente] = useState<number | null>(null);
  const [clientePlanta, setClientePlanta] = useState("");
  const [clientePuerta, setClientePuerta] = useState("");

  const handleZonaChange = (zonaId: number) => {
    setIdZona(zonaId);
    setLat(null);
    setLng(null);
    setIdCliente(null);
    setClientePlanta("");
    setClientePuerta("");
  };

  const [existingEdificioId, setExistingEdificioId] = useState<number | "">(
    "",
  );
  const [clientes, setClientes] = useState<EdificioClienteBlock[]>([]);
  const [clientesSinEdificio, setClientesSinEdificio] = useState<Cliente[]>([]);
  // const [loadingClientes, setLoadingClientes] = useState(false);

  useEffect(() => {
    if (!show) return;

    // queueMicrotask para asegurar que el estado se actualice después de que el modal se haya renderizado, 
    // evitando posibles problemas de renderizado condicional
    queueMicrotask(() => {
      if (edificioAEditar) {
        // Modo edición
        setMode("new");
        setDireccionCompleta(edificioAEditar.direccion_completa);
        setTipo(edificioAEditar.tipo);
        setIdZona(edificioAEditar.id_zona);
        if (edificioAEditar.ubicacion) {
          setLat(edificioAEditar.ubicacion.lat);
          setLng(edificioAEditar.ubicacion.lng);
        }
        setIdCliente(null);
        setClientePlanta("");
        setClientePuerta("");
        setExistingEdificioId("");
        setClientes([]);
      } else {
        // Modo crear
        setMode("new");
        setDireccionCompleta("");
        setTipo("");
        setIdZona(zonas?.[0]?.id ?? 0);
        setLat(null);
        setLng(null);
        setIdCliente(null);
        setExistingEdificioId("");
        setClientes([]);
      }
    });
  }, [show, zonas, edificios, edificioAEditar]);

  // Cargar clientes sin edificio cuando el modo es "existing"
  useEffect(() => {
    if (!show || mode !== "existing") return;

    // Resetear clientes al cambiar a modo "existing"
    setClientes([]);

    const cargarClientesSinEdificio = async () => {
      // setLoadingClientes(true);
      try {
        const clientes = await clientesService.getClientesSinEdificio();
        setClientesSinEdificio(clientes);
      } catch (err) {
        console.error("Error al cargar clientes sin edificio:", err);
        setClientesSinEdificio([]);
      } finally {
        // setLoadingClientes(false);
      }
    };

    cargarClientesSinEdificio();
  }, [show, mode]);

  // ya no es necesario este efecto, la lógica se maneja con el callback de selección de zona
  if (!show) return null;

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    // Si estamos en modo edición
    if (edificioAEditar && mode === "new") {
      if (!direccionCompleta.trim()) {
        showInfoAlert("Dirección completa es obligatorio.");
        return;
      }

      if (!tipo.trim()) {
        showInfoAlert("Tipo de edificio es obligatorio.");
        return;
      }

      if (!idZona || idZona <= 0) {
        showInfoAlert("Selecciona una zona válida.");
        return;
      }

      if (lat == null || lng == null) {
        showInfoAlert("Selecciona una ubicación en el mapa dentro de la zona.");
        return;
      }

      if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
        showInfoAlert("Ubicación no válida.");
        return;
      }

      try {
        if (onUpdateEdificio) {
          await onUpdateEdificio(edificioAEditar.id, {
            direccion_completa: direccionCompleta.trim(),
            tipo: tipo.trim(),
            id_zona: idZona,
            ubicacion: { lat, lng },
          });
          showSuccessAlert("Edificio actualizado correctamente");
        }
      } catch (updateError) {
        const message =
          updateError instanceof Error
            ? updateError.message
            : "Error al actualizar el edificio";
        console.error("updateEdificio error:", updateError);
        showErrorAlert(message);
        return;
      }

      onClose();
      return;
    }

    if (mode === "new") {
      if (!direccionCompleta.trim()) {
        showInfoAlert("Dirección completa es obligatorio.");
        return;
      }

      if (!tipo.trim()) {
        showInfoAlert("Tipo de edificio es obligatorio.");
        return;
      }

      if (!idZona || idZona <= 0) {
        showInfoAlert("Selecciona una zona válida.");
        return;
      }

      if (lat == null || lng == null) {
        showInfoAlert("Selecciona una ubicación en el mapa dentro de la zona.");
        return;
      }

      if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
        showInfoAlert("Ubicación no válida.");
        return;
      }

      try {
        const nuevoEdificio = await onCreateEdificio({
          direccion_completa: direccionCompleta.trim(),
          tipo: tipo.trim(),
          id_zona: idZona,
          ubicacion: { lat, lng },
          // NO pasar id_cliente aquí - será adjuntado después en la pivote
        });

        // Adjuntar cliente con planta y puerta (si están completos)
        if (idCliente && idCliente > 0) {
          await onAppendMultipleClientes(nuevoEdificio.id, [
            {
              id: Math.random().toString(36).substr(2, 9),
              mode: "seleccionar",
              nombre: "",
              apellidos: "",
              email: "",
              telefono: "",
              clienteSinEdificioId: idCliente,
              planta: clientePlanta.trim(),
              puerta: clientePuerta.trim(),
            },
          ]);
        }

        showSuccessAlert("Edificio creado correctamente");
      } catch (createError) {
        const message =
          createError instanceof Error
            ? createError.message
            : "Error al crear el edificio";
        console.error("createEdificio error:", createError);
        showErrorAlert(message);
        return;
      }

      onClose();
      return;
    }

    if (mode === "existing") {
      if (existingEdificioId === "") {
        showInfoAlert("Selecciona un edificio válido");
        return;
      }

      if (clientes.length === 0) {
        showInfoAlert("Agrega al menos un cliente");
        return;
      }

      // Validar todos los clientes
      for (const cliente of clientes) {
        if (!cliente.planta.trim() || !cliente.puerta.trim()) {
          showInfoAlert("Completa piso y puerta para todos los clientes");
          return;
        }

        if (cliente.mode === "crear") {
          if (!cliente.nombre.trim()) {
            showInfoAlert("Completa el nombre para todos los clientes a crear");
            return;
          }
        } else {
          if (!cliente.clienteSinEdificioId) {
            showInfoAlert("Selecciona un cliente para todos los bloques");
            return;
          }
        }
      }

      // Procesar todos los clientes en una sola solicitud al backend
      try {
        await onAppendMultipleClientes(existingEdificioId, clientes);
        onClose();
      } catch (appendError) {
        const message =
          appendError instanceof Error
            ? appendError.message
            : "Error al agregar clientes";
        console.error("appendMultipleClientes error:", appendError);
        showErrorAlert(message);
        return;
      }

      onClose();
      return;
    }
  };

  return (
    <div className="edificios-modal-overlay" onClick={onClose}>
      <div
        className="edificios-modal"
        onClick={(event) => event.stopPropagation()}
      >
        {/* Botones de pestañas - solo mostrar si no es edición */}
        {!edificioAEditar && <EdificioModalPestaña mode={mode} setMode={setMode} />}

        {/* Formulario  */}
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
            // Formulario 2
            <>
              <EdificioModalCliente
                existingEdificioId={existingEdificioId}
                setExistingEdificioId={setExistingEdificioId}
                clientesSinEdificio={clientesSinEdificio}
                edificios={edificios}
                clientes={clientes}
                setClientes={setClientes}
              />
            </>
          )}

          {/* Acciones del formulario */}
          <div className="form-edificio-actions">
            <button
              className="form-edificio-cancel"
              type="button"
              onClick={onClose}
              disabled={loading}
            >
              Cancelar
            </button>
            <button
              className="form-edificio-submit"
              type="submit"
              disabled={loading}
            >
              {loading
                ? edificioAEditar
                  ? "Actualizando..."
                  : mode === "new"
                    ? "Creando..."
                    : "Añadiendo..."
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
};

export default EdificioCreateModal;
