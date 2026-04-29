import { useState } from "react";
import type { Cliente } from "../../../types";

import '../../../styles/components/Edificios/FormularioModal/EdificioModalCliente.css';

interface ClienteBlock {
  id: string;
  mode: "crear" | "seleccionar";
  nombre: string;
  apellidos: string;
  email: string;
  telefono: string;
  clienteSinEdificioId: number | null;
  planta: string;
  puerta: string;
}

interface EdificioModalClienteProps {
  existingEdificioId: number | "";
  setExistingEdificioId: (id: number | "") => void;
  clientesSinEdificio: Cliente[];
  edificios: { id: number; direccion_completa: string }[];
  // Múltiples clientes
  clientes: ClienteBlock[];
  setClientes: (clientes: ClienteBlock[]) => void;
}

const generarId = () => Math.random().toString(36).substr(2, 9);

const formatClienteNombre = (cliente: Cliente) => {
  const apellidos = cliente.apellidos?.trim() ?? "";
  const lowerApellidos = apellidos.toLowerCase();
  if (!apellidos || lowerApellidos === "sin apellidos" || lowerApellidos === "sin apellido") {
    return cliente.nombre;
  }
  return `${cliente.nombre} ${apellidos}`;
};

const EdificioModalCliente = ({
  existingEdificioId,
  setExistingEdificioId,
  clientesSinEdificio,
  edificios,
  clientes,
  setClientes,
}: EdificioModalClienteProps) => {
  const [expandedClienteId, setExpandedClienteId] = useState<string | null>(null);

  const agregarCliente = () => {
    const nuevoCliente: ClienteBlock = {
      id: generarId(),
      mode: "crear",
      nombre: "",
      apellidos: "",
      email: "",
      telefono: "",
      clienteSinEdificioId: null,
      planta: "",
      puerta: "",
    };
    setClientes([...clientes, nuevoCliente]);
    setExpandedClienteId(nuevoCliente.id);
  };

  const eliminarCliente = (id: string) => {
    setClientes(clientes.filter((cliente) => cliente.id !== id));
    if (expandedClienteId === id) {
      setExpandedClienteId(null);
    }
  };

  const actualizarCliente = (id: string, updates: Partial<ClienteBlock>) => {
    setClientes(
      clientes.map((cliente) => (cliente.id === id ? { ...cliente, ...updates } : cliente))
    );
  };

  const handleFillHouseFields = (clienteId: string) => {
    actualizarCliente(clienteId, { planta: "Baja", puerta: "S/N" });
  };

  // Función para obtener clientes disponibles para un bloque específico
  // Excluye los clientes seleccionados en OTROS bloques, pero permite el cliente del bloque actual
  const getClientesDisponiblesForBloque = (bloqueActualId: string) => {
    const clientesSinEdificioSeleccionadosEnOtrosBloques = new Set(
      clientes
        .filter((cliente) => cliente.id !== bloqueActualId && cliente.mode === "seleccionar" && cliente.clienteSinEdificioId)
        .map((cliente) => cliente.clienteSinEdificioId)
    );

    return clientesSinEdificio.filter(
      (cliente) => !clientesSinEdificioSeleccionadosEnOtrosBloques.has(cliente.id)
    );
  };

  return (
    <>
      <h2 className="form-edificio-title">
        Adjuntar clientes a edificio existente
      </h2>

      {/* Selector de edificio */}
      <select
        className="form-edificio-input"
        value={existingEdificioId}
        onChange={(edificio) => setExistingEdificioId(edificio.target.value ? Number(edificio.target.value) : "")}
      >
        <option value="">Selecciona un edificio</option>
        {edificios.map((ed) => (
          <option key={ed.id} value={ed.id}>
            {ed.direccion_completa}
          </option>
        ))}
      </select>

      {/* Bloques de clientes */}
      <div className="clientes-bloques">
        {clientes.length === 0 ? (
          <p style={{ color: "#9ca3af", textAlign: "center", margin: "16px 0" }}>
            No hay clientes agregados. Haz clic en "Agregar cliente" para comenzar.
          </p>
        ) : (
          clientes.map((cliente) => (
            <div key={cliente.id} className="cliente-bloque">
              <div className="cliente-bloque-header">
                <button
                  type="button"
                  className="cliente-bloque-toggle"
                  onClick={() =>
                    setExpandedClienteId(
                      expandedClienteId === cliente.id ? null : cliente.id
                    )
                  }
                >
                  {expandedClienteId === cliente.id ? "▼" : "▶"} Cliente #{clientes.indexOf(cliente) + 1}
                </button>
                <button
                  type="button"
                  className="cliente-bloque-delete"
                  onClick={() => eliminarCliente(cliente.id)}
                  title="Eliminar cliente"
                >
                  ✕
                </button>
              </div>

              {expandedClienteId === cliente.id && (
                <div className="cliente-bloque-content">
                  {/* Modo: crear vs seleccionar */}
                  <div className="form-edificio-mode-selector">
                    <button
                      type="button"
                      className={`mode-btn ${cliente.mode === "crear" ? "active" : ""}`}
                      onClick={() => actualizarCliente(cliente.id, { mode: "crear" })}
                    >
                      Crear cliente nuevo
                    </button>
                    {getClientesDisponiblesForBloque(cliente.id).length > 0 && (
                      <button
                        type="button"
                        className={`mode-btn ${cliente.mode === "seleccionar" ? "active" : ""}`}
                        onClick={() => actualizarCliente(cliente.id, { mode: "seleccionar" })}
                      >
                        Seleccionar existente
                      </button>
                    )}
                  </div>

                  {cliente.mode === "crear" ? (
                    <>
                      <input
                        className="form-edificio-input"
                        type="text"
                        placeholder="Nombre cliente"
                        value={cliente.nombre}
                        onChange={(edificio) => actualizarCliente(cliente.id, { nombre: edificio.target.value })}
                        maxLength={50}
                        required
                      />
                      <input
                        className="form-edificio-input"
                        type="text"
                        placeholder="Apellidos cliente (opcional)"
                        value={cliente.apellidos}
                        onChange={(edificio) =>
                          actualizarCliente(cliente.id, {
                            apellidos: edificio.target.value.slice(0, 100),
                          })
                        }
                        maxLength={100}
                      />
                      <input
                        className="form-edificio-input"
                        type="email"
                        placeholder="Correo electrónico (opcional)"
                        value={cliente.email}
                        onChange={(edificio) => actualizarCliente(cliente.id, { email: edificio.target.value.slice(0, 100) })}
                        maxLength={100}
                      />
                      <input
                        className="form-edificio-input"
                        type="tel"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        placeholder="Teléfono (opcional)"
                        value={cliente.telefono}
                        onChange={(edificio) =>
                          actualizarCliente(cliente.id, {
                            telefono: edificio.target.value.replace(/\D/g, "").slice(0, 15),
                          })
                        }
                        maxLength={15}
                      />
                    </>
                  ) : (
                    <select
                      className="form-edificio-input"
                      value={cliente.clienteSinEdificioId ?? ""}
                      onChange={(edificio) =>
                        actualizarCliente(cliente.id, {
                          clienteSinEdificioId: edificio.target.value ? Number(edificio.target.value) : null,
                        })
                      }
                      required
                    >
                      <option value="">Selecciona un cliente</option>
                      {getClientesDisponiblesForBloque(cliente.id).map((clienteTMP) => (
                        <option key={clienteTMP.id} value={clienteTMP.id}>
                          {formatClienteNombre(clienteTMP)} - {clienteTMP.email || clienteTMP.telefono || "Sin contacto"}
                        </option>
                      ))}
                    </select>
                  )}

                  {/* Piso y puerta con botón de Casa */}
                  <div className="form-edificio-fields-group">
                    <div className="form-edificio-fields-wrapper">
                      <input
                        className="form-edificio-input"
                        type="text"
                        placeholder="Piso/Planta"
                        value={cliente.planta}
                        onChange={(edificio) => actualizarCliente(cliente.id, { planta: edificio.target.value })}
                        required
                      />
                      <input
                        className="form-edificio-input"
                        type="text"
                        placeholder="Puerta"
                        value={cliente.puerta}
                        onChange={(edificio) => actualizarCliente(cliente.id, { puerta: edificio.target.value })}
                        required
                      />
                    </div>
                    <button
                      type="button"
                      className="form-edificio-house-btn"
                      onClick={() => handleFillHouseFields(cliente.id)}
                      title="Rellenar para una casa (Baja, S/N)"
                    >
                      🏠 Casa
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Botón para agregar otro cliente */}
      <button
        type="button"
        className="form-edificio-add-cliente"
        onClick={agregarCliente}
      >
        + Agregar otro cliente
      </button>
    </>
  );
};

export default EdificioModalCliente;
