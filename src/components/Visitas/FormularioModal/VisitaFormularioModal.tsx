import { useEffect, useState, type FormEvent } from "react";
import type { Cliente, EstadoVisita } from "../../../types";
import { clientesService } from "../../../services/ClientesService";
import "../../../styles/components/Visitas/FormularioModal/VisitaFormularioModal.css";

export type VisitaFormValues = {
  id_cliente: number;
  fecha_hora: string;
  id_estado: number;
  observaciones: string;
};

type ClientePreview = Pick<Cliente, "id" | "nombre" | "apellidos">;

interface VisitaFormularioModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (values: VisitaFormValues) => Promise<void>;
  clientes: Cliente[];
  estados: EstadoVisita[];
  initialValues?: VisitaFormValues;
  selectedClient?: ClientePreview | null;
  mode: "create" | "edit";
}

const formatDateForInput = (value: string) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return new Date().toISOString().slice(0, 16);
  const tzOffset = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() - tzOffset).toISOString().slice(0, 16);
};

const splitDatetime = (datetime: string) => {
  const date = datetime.slice(0, 10); // YYYY-MM-DD
  const time = datetime.slice(11, 16); // HH:MM
  return { date, time };
};

const combineDatetime = (date: string, time: string) => {
  return `${date}T${time}`;
};

const MAX_OBSERVACIONES_LENGTH = 80;

const getCurrentLocalDateTime = () => {
  const date = new Date();
  const tzOffset = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() - tzOffset).toISOString().slice(0, 16);
};

const VisitaFormularioModal = ({
  open,
  onClose,
  onSubmit,
  clientes,
  estados,
  initialValues,
  selectedClient,
  mode,
}: VisitaFormularioModalProps) => {
  const isEditMode = mode === "edit";
  const clientId = selectedClient?.id ?? initialValues?.id_cliente ?? 0;
  const localClient = clientId ? clientes.find((cliente) => cliente.id === clientId) : undefined;
  const defaultClientName = selectedClient
    ? `${selectedClient.nombre} ${selectedClient.apellidos}`
    : localClient
    ? `${localClient.nombre} ${localClient.apellidos}`
    : "";

  const [values, setValues] = useState<VisitaFormValues>({
    id_cliente: clientId,
    fecha_hora: initialValues
      ? formatDateForInput(initialValues.fecha_hora)
      : new Date().toISOString().slice(0, 16),
    id_estado: initialValues?.id_estado ?? 0, // Por defecto 0 = sin seleccionar
    observaciones: (initialValues?.observaciones ?? "").slice(0, MAX_OBSERVACIONES_LENGTH),
  });
  const [clientQuery, setClientQuery] = useState(isEditMode ? defaultClientName : "");

  // Estados separados para fecha y hora
  const { date: initialDate, time: initialTime } = splitDatetime(values.fecha_hora);
  const [selectedDate, setSelectedDate] = useState(initialDate);
  const [selectedTime, setSelectedTime] = useState(initialTime);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Resetear formulario cuando el modal se abre en modo create
  useEffect(() => {
    if (!open) return;
    
    if (mode === "create") {
      // Limpiar formulario para nueva visita
      setValues({
        id_cliente: clientId,
        fecha_hora: new Date().toISOString().slice(0, 16),
        id_estado: 0, // Resetear estado a sin seleccionar
        observaciones: "",
      });
      setClientQuery("");
    }
  }, [open, mode, clientId]);

  // Sincronizar fecha/hora con el estado general
  useEffect(() => {
    setValues((prev) => ({
      ...prev,
      fecha_hora: combineDatetime(selectedDate, selectedTime),
    }));
  }, [selectedDate, selectedTime]);

  useEffect(() => {
    if (!isEditMode || clientId <= 0 || defaultClientName) return;

    let cancelled = false;

    clientesService
      .getClienteById(clientId)
      .then((cliente) => {
        if (cancelled) return;
        setClientQuery(`${cliente.nombre} ${cliente.apellidos}`);
        setValues((prev) => ({ ...prev, id_cliente: cliente.id }));
      })
      .catch((error) => {
        console.error("Error al cargar cliente de edición:", error);
      });

    return () => {
      cancelled = true;
    };
  }, [clientId, defaultClientName, isEditMode]);

  // Sincronizar selectedClient con values.id_cliente en modo create
  useEffect(() => {
    if (isEditMode || !selectedClient) return;
    // Usar callback asincrónico para evitar setState sincrónico
    Promise.resolve().then(() => {
      setValues((prev) => ({
        ...prev,
        id_cliente: selectedClient.id,
      }));
    });
  }, [selectedClient, isEditMode]);

  const editClient = initialValues
    ? clientes.find((cliente) => cliente.id === initialValues.id_cliente)
    : undefined;

  const selectedClientName = selectedClient
    ? `${selectedClient.nombre} ${selectedClient.apellidos}`
    : editClient
    ? `${editClient.nombre} ${editClient.apellidos}`
    : "";

  const clientPlaceholder = isEditMode
    ? selectedClientName || "Cliente cargando..."
    : "Escribe el nombre del cliente";

  if (!open) return null;

  const handleChange = (field: keyof VisitaFormValues, value: string) => {
    setValues((prev) => ({
      ...prev,
      [field]:
        field === "id_cliente" || field === "id_estado"
          ? Number(value)
          : field === "observaciones"
          ? value.slice(0, MAX_OBSERVACIONES_LENGTH)
          : value,
    }));
  };

  const filteredClients = clientes.filter((cliente) => {
    const label = `${cliente.nombre} ${cliente.apellidos}`.toLowerCase();
    return clientQuery.trim() !== "" && label.includes(clientQuery.toLowerCase());
  });

  const exactMatchClient = clientes.find((cliente) => {
    const label = `${cliente.nombre} ${cliente.apellidos}`.toLowerCase();
    return label === clientQuery.trim().toLowerCase();
  });

  const showClientSuggestions = !isEditMode && !selectedClient && clientQuery.trim().length > 0 && !exactMatchClient && filteredClients.length > 0;
  const canSubmit = values.id_cliente > 0 && values.id_estado > 0;


  const handleClientQueryChange = (value: string) => {
    setClientQuery(value);

    const exactMatch = clientes.find((cliente) => {
      const label = `${cliente.nombre} ${cliente.apellidos}`.toLowerCase();
      return label === value.trim().toLowerCase();
    });

    setValues((prev) => ({
      ...prev,
      id_cliente: exactMatch ? exactMatch.id : 0,
    }));
  };

  const handleSetCurrentTime = () => {
    const now = getCurrentLocalDateTime();
    const { date, time } = splitDatetime(now);
    setSelectedDate(date);
    setSelectedTime(time);
  };

  const handleSelectClient = (cliente: Cliente) => {
    setValues((prev) => ({ ...prev, id_cliente: cliente.id }));
    setClientQuery(`${cliente.nombre} ${cliente.apellidos}`);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    // Sincronizar id_cliente con selectedClient si está disponible en modo create
    const finalValues: VisitaFormValues = {
      ...values,
      id_cliente: !isEditMode && selectedClient?.id ? selectedClient.id : values.id_cliente,
      observaciones: values.observaciones.slice(0, MAX_OBSERVACIONES_LENGTH),
    };

    if (!finalValues.id_cliente || finalValues.id_cliente <= 0) {
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(finalValues);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="visita-modal-overlay" onClick={onClose}>
      <div className="visita-modal" onClick={(event) => event.stopPropagation()}>
        <div className="visita-modal-header">
          <h2>{mode === "create" ? "Crear visita" : "Editar visita"}</h2>
          <button 
            type="button" 
            className="visita-modal-close" 
            onClick={onClose}
            disabled={isSubmitting}
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="visita-form">
          <label htmlFor="cliente-search">Cliente</label>
          <input
            id="cliente-search"
            type="text"
            value={
              isEditMode 
                ? selectedClientName 
                : selectedClient 
                  ? `${selectedClient.nombre} ${selectedClient.apellidos}`
                  : clientQuery
            }
            onChange={(event) => {
              if (!isEditMode) {
                handleClientQueryChange(event.target.value);
              }
            }}
            className="visita-search-input"
            placeholder={clientPlaceholder}
            autoComplete="off"
            disabled={isEditMode || !!selectedClient || isSubmitting}
          />
          {showClientSuggestions && (
            <ul className="visita-client-list">
              {filteredClients.slice(0, 8).map((cliente) => (
                <li
                  key={cliente.id}
                  className="visita-client-option"
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => handleSelectClient(cliente)}
                >
                  {cliente.nombre} {cliente.apellidos}
                </li>
              ))}
            </ul>
          )}
          {!isEditMode && clientQuery.trim().length > 0 && filteredClients.length === 0 && (
            <div className="visita-client-empty">No se encontró ningún cliente</div>
          )}

          <label htmlFor="fecha">Fecha y hora</label>
          <div className="visita-fecha-row">
            <input
              id="fecha"
              type="date"
              value={selectedDate}
              max={getCurrentLocalDateTime().slice(0, 10)}
              onChange={(event) => setSelectedDate(event.target.value)}
              disabled={isSubmitting}
            />
            <input
              id="hora"
              type="time"
              value={selectedTime}
              onChange={(event) => setSelectedTime(event.target.value)}
              disabled={isSubmitting}
            />
            <button
              type="button"
              className="visita-current-time-button"
              onClick={handleSetCurrentTime}
              disabled={isSubmitting}
            >
              Ahora
            </button>
          </div>

          <label htmlFor="estado">Estado</label>
          <select
            id="estado"
            value={values.id_estado}
            onChange={(event) => handleChange("id_estado", event.target.value)}
            disabled={isSubmitting}
          >
            <option value="">-- Seleccionar estado --</option>
            {estados.map((estado) => (
              <option key={estado.id} value={estado.id}>
                {estado.etiqueta}
              </option>
            ))}
          </select>

          <label htmlFor="observaciones">Observaciones (opcional)</label>
          <textarea
            id="observaciones"
            value={values.observaciones}
            onChange={(event) => handleChange("observaciones", event.target.value)}
            placeholder="Puedes añadir detalles de la visita, pero no es obligatorio"
            disabled={isSubmitting}
          />

          {!canSubmit && (
            <div className="visita-client-warning">
              {values.id_cliente === 0 ? "Selecciona un cliente" : "Selecciona un estado"} antes de guardar.
            </div>
          )}

          <button 
            type="submit" 
            className="visita-modal-submit" 
            disabled={!canSubmit || isSubmitting}
          >
            {isSubmitting ? "Guardando..." : "Guardar"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default VisitaFormularioModal;
