import type { Cliente } from "../../../types/clientes/Cliente";

import '../../../styles/components/Edificios/FormularioModal/EdificioModalCliente.css';

interface EdificioModalClienteProps {
  existingEdificioId: number;
  setExistingEdificioId: (id: number) => void;
  clienteMode: "crear" | "seleccionar";
  setClienteMode: (mode: "crear" | "seleccionar") => void;
  // Para crear nuevo cliente
  clienteNombre: string;
  setClienteNombre: (nombre: string) => void;
  clienteApellidos: string;
  setClienteApellidos: (apellidos: string) => void;
  clienteTelefono: string;
  setClienteTelefono: (telefono: string) => void;
  clienteEmail: string;
  setClienteEmail: (email: string) => void;
  // Para seleccionar cliente existente
  clienteSinEdificioId: number | null;
  setClienteSinEdificioId: (id: number | null) => void;
  clientesSinEdificio: Cliente[];
  // Edificios
  edificios: { id: number; direccion_completa: string }[];
  // Piso y puerta
  clientePlanta: string;
  setClientePlanta: (planta: string) => void;
  clientePuerta: string;
  setClientePuerta: (puerta: string) => void;
}

const EdificioModalCliente = ({
  existingEdificioId,
  setExistingEdificioId,
  clienteMode,
  setClienteMode,
  clienteNombre,
  setClienteNombre,
  clienteApellidos,
  setClienteApellidos,
  clienteTelefono,
  setClienteTelefono,
  clienteEmail,
  setClienteEmail,
  clienteSinEdificioId,
  setClienteSinEdificioId,
  clientesSinEdificio,
  edificios,
  clientePlanta,
  setClientePlanta,
  clientePuerta,
  setClientePuerta,
}: EdificioModalClienteProps) => {
  const handleFillHouseFields = () => {
    setClientePlanta("Baja");
    setClientePuerta("S/N");
  };

  return (
    <>
      <h2 className="form-edificio-title">
        Adjuntar cliente a edificio existente
      </h2>

      {/* Selector de edificio */}
      <select
        className="form-edificio-input"
        value={existingEdificioId}
        onChange={(e) => setExistingEdificioId(Number(e.target.value))}
      >
        <option value="">Selecciona un edificio</option>
        {edificios.map((ed) => (
          <option key={ed.id} value={ed.id}>
            {ed.direccion_completa}
          </option>
        ))}
      </select>

      {/* Piso y puerta con botón de Casa */}
      <div className="form-edificio-fields-group">
        <div className="form-edificio-fields-wrapper">
          <input
            className="form-edificio-input"
            type="text"
            placeholder="Piso/Planta"
            value={clientePlanta}
            onChange={(e) => setClientePlanta(e.target.value)}
            required
          />
          <input
            className="form-edificio-input"
            type="text"
            placeholder="Puerta"
            value={clientePuerta}
            onChange={(e) => setClientePuerta(e.target.value)}
            required
          />
        </div>
        <button
          type="button"
          className="form-edificio-house-btn"
          onClick={handleFillHouseFields}
          title="Rellenar para una casa (Baja, S/N)"
        >
          🏠 Casa
        </button>
      </div>

      {/* Selector de modo: crear vs seleccionar */}
      <div className="form-edificio-mode-selector">
        <button
          type="button"
          className={`mode-btn ${clienteMode === "crear" ? "active" : ""}`}
          onClick={() => setClienteMode("crear")}
        >
          Crear cliente nuevo
        </button>
        {clientesSinEdificio.length > 0 && (
          <button
            type="button"
            className={`mode-btn ${clienteMode === "seleccionar" ? "active" : ""}`}
            onClick={() => setClienteMode("seleccionar")}
          >
            Seleccionar existente
          </button>
        )}
      </div>

      {clienteMode === "crear" ? (
        <>
          <input
            className="form-edificio-input"
            type="text"
            placeholder="Nombre cliente"
            value={clienteNombre}
            onChange={(e) => setClienteNombre(e.target.value)}
            required
          />
          <input
            className="form-edificio-input"
            type="text"
            placeholder="Apellidos cliente"
            value={clienteApellidos}
            onChange={(e) => setClienteApellidos(e.target.value)}
            required
          />
          <input
            className="form-edificio-input"
            type="email"
            placeholder="Correo electrónico (opcional)"
            value={clienteEmail}
            onChange={(e) => setClienteEmail(e.target.value)}
          />
          <input
            className="form-edificio-input"
            type="tel"
            placeholder="Teléfono (opcional)"
            value={clienteTelefono}
            onChange={(e) => setClienteTelefono(e.target.value)}
          />
        </>
      ) : (
        <select
          className="form-edificio-input"
          value={clienteSinEdificioId ?? ""}
          onChange={(e) => setClienteSinEdificioId(e.target.value ? Number(e.target.value) : null)}
          required
        >
          <option value="">Selecciona un cliente</option>
          {clientesSinEdificio.map((cliente) => (
            <option key={cliente.id} value={cliente.id}>
              {cliente.nombre} {cliente.apellidos} - {cliente.email || cliente.telefono || "Sin contacto"}
            </option>
          ))}
        </select>
      )}
    </>
  );
};

export default EdificioModalCliente;
