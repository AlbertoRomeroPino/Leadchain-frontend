import React, { useEffect, useState } from "react";
import type { EdificioInput, Edificio } from "../../types/edificios/Edificio";
import type { Zona } from "../../types/zonas/Zona";
import "../../styles/EdificioCreateModal.css";
import EdificioModalPestaña from "./FormularioModal/EdificioModalPestaña";
import EdificioModalEdificio from "./FormularioModal/EdificioModalEdificio";
import EdificioModalMapa from "./FormularioModal/EdificioModalMapa";
import EdificioModalCliente from "./FormularioModal/EdificioModalCliente";

interface EdificioCreateModalProps {
  show: boolean;
  loading: boolean;
  zonas: Zona[];
  edificios: Edificio[];
  onClose: () => void;
  onCreateEdificio: (payload: EdificioInput) => Promise<void>;
  onAppendToExisting: (
    edificioId: number,
    clienteNombre: string,
    clienteApellidos: string,
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
  const [planta, setPlanta] = useState<string>("");
  const [puerta, setPuerta] = useState<string>("");
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

  useEffect(() => {
    if (!show) return;

    queueMicrotask(() => {
      if (edificioAEditar) {
        // Modo edición
        setMode("new");
        setDireccionCompleta(edificioAEditar.direccion_completa);
        setTipo(edificioAEditar.tipo);
        setPlanta(edificioAEditar.planta || "");
        setPuerta(edificioAEditar.puerta || "");
        setIdZona(edificioAEditar.id_zona);
        if (edificioAEditar.ubicacion) {
          setLat(edificioAEditar.ubicacion.lat);
          setLng(edificioAEditar.ubicacion.lng);
        }
        setIdCliente(edificioAEditar.id_cliente);
        setExistingEdificioId(edificios?.[0]?.id ?? 0);
        setClienteNombre("");
        setClienteApellidos("");
      } else {
        // Modo crear
        setMode("new");
        setDireccionCompleta("");
        setTipo("");
        setPlanta("");
        setPuerta("");
        setIdZona(zonas?.[0]?.id ?? 0);
        setLat(null);
        setLng(null);
        setIdCliente(null);
        setExistingEdificioId(edificios?.[0]?.id ?? 0);
        setClienteNombre("");
        setClienteApellidos("");
      }
    });
  }, [show, zonas, edificios, edificioAEditar]);

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
            planta: planta.trim() || null,
            puerta: puerta.trim() || null,
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
          planta: planta.trim() || null,
          puerta: puerta.trim() || null,
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
      if (
        !existingEdificioId ||
        !clienteNombre.trim() ||
        !clienteApellidos.trim()
      ) {
        alert("Selecciona edificio y completa datos del cliente");
        return;
      }

      try {
        await onAppendToExisting(
          existingEdificioId,
          clienteNombre.trim(),
          clienteApellidos.trim(),
        );
        alert("Cliente añadido al edificio");
      } catch (appendError) {
        const message =
          appendError instanceof Error
            ? appendError.message
            : "Error al añadir cliente al edificio";
        console.error("appendToExisting error:", appendError);
        alert(message);
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
                planta={planta}
                setPlanta={setPlanta}
                puerta={puerta}
                setPuerta={setPuerta}
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
            // Fromulario 2
            <>
              <EdificioModalCliente
                existingEdificioId={existingEdificioId}
                setExistingEdificioId={setExistingEdificioId}
                clienteNombre={clienteNombre}
                setClienteNombre={setClienteNombre}
                clienteApellidos={clienteApellidos}
                setClienteApellidos={setClienteApellidos}
                edificios={edificios}
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
