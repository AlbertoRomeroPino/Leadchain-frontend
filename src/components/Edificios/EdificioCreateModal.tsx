import React, { useEffect, useState } from "react";
import type { EdificioInput, Edificio } from "../../types/edificios/Edificio";
import type { Zona } from "../../types/zonas/Zona";
import type { Cliente } from "../../types/clientes/Cliente";
import "../../styles/EdificioCreateModal.css";
import EdificioModalPestaña from "./FormularioModal/EdificioModalPestaña";
import EdificioModalEdificio from "./FormularioModal/EdificioModalEdificio";
import EdificioModalMapa from "./FormularioModal/EdificioModalMapa";
import EdificioModalCliente from "./FormularioModal/EdificioModalCliente";
import { clientesService } from "../../services/ClientesService";

interface EdificioCreateModalProps {
  show: boolean;
  loading: boolean;
  zonas: Zona[];
  edificios: Edificio[];
  onClose: () => void;
  onCreateEdificio: (payload: EdificioInput) => Promise<void>;
  onAppendToExisting: (
    edificioId: number,
    clienteNombre?: string,
    clienteApellidos?: string,
    clienteEmail?: string,
    clienteTelefono?: string,
    clienteExistenteId?: number,
    clientePlanta?: string,
    clientePuerta?: string,
  ) => Promise<void>;
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
  onAppendToExisting,
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

  const handleZonaChange = (zonaId: number) => {
    setIdZona(zonaId);
    setLat(null);
    setLng(null);
    setIdCliente(null);
  };

  const [existingEdificioId, setExistingEdificioId] = useState<number>(
    edificios?.[0]?.id ?? 0,
  );
  const [clienteNombre, setClienteNombre] = useState("");
  const [clienteApellidos, setClienteApellidos] = useState("");
  const [clienteTelefono, setClienteTelefono] = useState("");
  const [clienteEmail, setClienteEmail] = useState("");
  const [clienteMode, setClienteMode] = useState<"crear" | "seleccionar">("crear");
  const [clienteSinEdificioId, setClienteSinEdificioId] = useState<number | null>(null);
  const [clientesSinEdificio, setClientesSinEdificio] = useState<Cliente[]>([]);
  const [clientePlanta, setClientePlanta] = useState<string>("");
  const [clientePuerta, setClientePuerta] = useState<string>("");
  const [loadingClientes, setLoadingClientes] = useState(false);

  useEffect(() => {
    if (!show) return;

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
        setIdCliente(edificioAEditar.id_cliente);
        setExistingEdificioId(edificios?.[0]?.id ?? 0);
        setClienteNombre("");
        setClienteApellidos("");
        setClienteEmail("");
        setClienteTelefono("");
        setClienteMode("crear");
        setClienteSinEdificioId(null);
        setClientePlanta("");
        setClientePuerta("");
      } else {
        // Modo crear
        setMode("new");
        setDireccionCompleta("");
        setTipo("");
        setIdZona(zonas?.[0]?.id ?? 0);
        setLat(null);
        setLng(null);
        setIdCliente(null);
        setExistingEdificioId(edificios?.[0]?.id ?? 0);
        setClienteNombre("");
        setClienteApellidos("");
        setClienteEmail("");
        setClienteTelefono("");
        setClienteMode("crear");
        setClienteSinEdificioId(null);
        setClientePlanta("");
        setClientePuerta("");
      }
    });
  }, [show, zonas, edificios, edificioAEditar]);

  // Cargar clientes sin edificio cuando el modo es "existing"
  useEffect(() => {
    if (!show || mode !== "existing") return;

    const cargarClientesSinEdificio = async () => {
      setLoadingClientes(true);
      try {
        const clientes = await clientesService.getClientesSinEdificio();
        setClientesSinEdificio(clientes);
      } catch (err) {
        console.error("Error al cargar clientes sin edificio:", err);
        setClientesSinEdificio([]);
      } finally {
        setLoadingClientes(false);
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
        alert("Dirección completa es obligatorio.");
        return;
      }

      if (!tipo.trim()) {
        alert("Tipo de edificio es obligatorio.");
        return;
      }

      if (!idZona || idZona <= 0) {
        alert("Selecciona una zona válida.");
        return;
      }

      if (lat == null || lng == null) {
        alert("Selecciona una ubicación en el mapa dentro de la zona.");
        return;
      }

      if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
        alert("Ubicación no válida.");
        return;
      }

      try {
        if (onUpdateEdificio) {
          await onUpdateEdificio(edificioAEditar.id, {
            direccion_completa: direccionCompleta.trim(),
            tipo: tipo.trim(),
            id_zona: idZona,
            ubicacion: { lat, lng },
            id_cliente: idCliente || edificioAEditar.id_cliente,
          });

          alert("Edificio actualizado correctamente");
        }
      } catch (updateError) {
        const message =
          updateError instanceof Error
            ? updateError.message
            : "Error al actualizar el edificio";
        console.error("updateEdificio error:", updateError);
        alert(message);
        return;
      }

      onClose();
      return;
    }

    if (mode === "new") {
      if (!direccionCompleta.trim()) {
        alert("Dirección completa es obligatorio.");
        return;
      }

      if (!tipo.trim()) {
        alert("Tipo de edificio es obligatorio.");
        return;
      }

      if (!idZona || idZona <= 0) {
        alert("Selecciona una zona válida.");
        return;
      }

      if (idCliente === null || idCliente <= 0) {
        alert("Selecciona un cliente.");
        return;
      }

      if (lat == null || lng == null) {
        alert("Selecciona una ubicación en el mapa dentro de la zona.");
        return;
      }

      if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
        alert("Ubicación no válida.");
        return;
      }

      try {
        await onCreateEdificio({
          direccion_completa: direccionCompleta.trim(),
          tipo: tipo.trim(),
          id_zona: idZona,
          ubicacion: { lat, lng },
          id_cliente: idCliente,
        });

        alert("Edificio creado correctamente");
      } catch (createError) {
        const message =
          createError instanceof Error
            ? createError.message
            : "Error al crear el edificio";
        console.error("createEdificio error:", createError);
        alert(message);
        return;
      }

      onClose();
      return;
    }

    if (mode === "existing") {
      if (!existingEdificioId) {
        alert("Selecciona un edificio válido");
        return;
      }

      if (!clientePlanta.trim() || !clientePuerta.trim()) {
        alert("Completa piso y puerta del cliente");
        return;
      }

      if (clienteMode === "crear") {
        // Crear nuevo cliente
        if (!clienteNombre.trim() || !clienteApellidos.trim()) {
          alert("Completa nombre y apellidos del cliente");
          return;
        }

        try {
          await onAppendToExisting(
            existingEdificioId,
            clienteNombre.trim(),
            clienteApellidos.trim(),
            clienteEmail.trim() || undefined,
            clienteTelefono.trim() || undefined,
            undefined,
            clientePlanta.trim(),
            clientePuerta.trim()
          );
          alert("Cliente creado y adjuntado al edificio");
        } catch (appendError) {
          const message =
            appendError instanceof Error
              ? appendError.message
              : "Error al crear cliente";
          console.error("appendToExisting error:", appendError);
          alert(message);
          return;
        }
      } else {
        // Seleccionar cliente existente
        if (!clienteSinEdificioId) {
          alert("Selecciona un cliente");
          return;
        }

        try {
          await onAppendToExisting(
            existingEdificioId,
            undefined,
            undefined,
            undefined,
            undefined,
            clienteSinEdificioId,
            clientePlanta.trim(),
            clientePuerta.trim()
          );
          alert("Cliente adjuntado al edificio");
        } catch (appendError) {
          const message =
            appendError instanceof Error
              ? appendError.message
              : "Error al adjuntar cliente";
          console.error("appendToExisting error:", appendError);
          alert(message);
          return;
        }
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
                clienteMode={clienteMode}
                setClienteMode={setClienteMode}
                clienteNombre={clienteNombre}
                setClienteNombre={setClienteNombre}
                clienteApellidos={clienteApellidos}
                setClienteApellidos={setClienteApellidos}
                clienteTelefono={clienteTelefono}
                setClienteTelefono={setClienteTelefono}
                clienteEmail={clienteEmail}
                setClienteEmail={setClienteEmail}
                clienteSinEdificioId={clienteSinEdificioId}
                setClienteSinEdificioId={setClienteSinEdificioId}
                clientesSinEdificio={clientesSinEdificio}
                edificios={edificios}
                clientePlanta={clientePlanta}
                setClientePlanta={setClientePlanta}
                clientePuerta={clientePuerta}
                setClientePuerta={setClientePuerta}
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
