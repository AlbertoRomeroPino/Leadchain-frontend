import { useEffect, useState, type FormEvent } from "react";
import type { Cliente } from "../../../types/clientes/Cliente";
import type { EstadoVisita } from "../../../types/visitas/EstadoVisita";
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
    id_estado: initialValues?.id_estado ?? estados[0]?.id ?? 0,
    observaciones: initialValues?.observaciones ?? "",
  });
  const [clientQuery, setClientQuery] = useState(defaultClientName);

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
      [field]: field === "id_cliente" || field === "id_estado" ? Number(value) : value,
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

  const showClientSuggestions = !isEditMode && clientQuery.trim().length > 0 && !exactMatchClient && filteredClients.length > 0;
  const canSubmit = values.id_cliente > 0;

  const getCurrentLocalDateTime = () => {
    const date = new Date();
    const tzOffset = date.getTimezoneOffset() * 60000;
    return new Date(date.getTime() - tzOffset).toISOString().slice(0, 16);
  };

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
    setValues((prev) => ({
      ...prev,
      fecha_hora: getCurrentLocalDateTime(),
    }));
  };

  const handleSelectClient = (cliente: Cliente) => {
    setValues((prev) => ({ ...prev, id_cliente: cliente.id }));
    setClientQuery(`${cliente.nombre} ${cliente.apellidos}`);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!canSubmit) {
      return;
    }

    await onSubmit(values);
  };

  return (
    <div className="visita-modal-overlay" onClick={onClose}>
      <div className="visita-modal" onClick={(event) => event.stopPropagation()}>
        <div className="visita-modal-header">
          <h2>{mode === "create" ? "Crear visita" : "Editar visita"}</h2>
          <button type="button" className="visita-modal-close" onClick={onClose}>
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="visita-form">
          <label htmlFor="cliente-search">Cliente</label>
          <input
            id="cliente-search"
            type="text"
            value={isEditMode ? selectedClientName : clientQuery}
            onChange={(event) => {
              if (!isEditMode) {
                handleClientQueryChange(event.target.value);
              }
            }}
            className="visita-search-input"
            placeholder={clientPlaceholder}
            autoComplete="off"
            disabled={isEditMode}
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
              type="datetime-local"
              value={values.fecha_hora}
              onChange={(event) => handleChange("fecha_hora", event.target.value)}
            />
            <button
              type="button"
              className="visita-current-time-button"
              onClick={handleSetCurrentTime}
            >
              Hora actual
            </button>
          </div>

          <label htmlFor="estado">Estado</label>
          <select
            id="estado"
            value={values.id_estado}
            onChange={(event) => handleChange("id_estado", event.target.value)}
          >
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
          />

          {!canSubmit && (
            <div className="visita-client-warning">
              Selecciona un cliente válido de tu zona antes de guardar.
            </div>
          )}

          <button type="submit" className="visita-modal-submit" disabled={!canSubmit}>
            Guardar
          </button>
        </form>
      </div>
    </div>
  );
};

export default VisitaFormularioModal;
