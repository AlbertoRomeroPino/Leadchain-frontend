import React from "react";

interface EdificioModalClienteProps {
  existingEdificioId: number;
  setExistingEdificioId: (id: number) => void;
  clienteNombre: string;
  setClienteNombre: (nombre: string) => void;
  clienteApellidos: string;
  setClienteApellidos: (apellidos: string) => void;
  edificios: { id: number; direccion_completa: string }[];
}

const EdificioModalCliente = ({
  existingEdificioId,
  setExistingEdificioId,
  clienteNombre,
  setClienteNombre,
  clienteApellidos,
  setClienteApellidos,
  edificios
}: EdificioModalClienteProps) => {
  return (
    <>
      <h2 className="form-edificio-title">
        Añadir cliente a edificio existente
      </h2>
      <select
        className="form-edificio-input"
        value={existingEdificioId}
        onChange={(e) => setExistingEdificioId(Number(e.target.value))}
      >
        {edificios.map((ed) => (
          <option key={ed.id} value={ed.id}>
            {ed.direccion_completa}
          </option>
        ))}
      </select>
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
    </>
  );
};

export default EdificioModalCliente;
