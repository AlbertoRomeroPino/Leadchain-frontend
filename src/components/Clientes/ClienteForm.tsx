import { useState } from "react";
import type { ClienteInput } from "../../types/clientes/Cliente";
import "../../styles/components/Clientes/ClienteForm.css";

interface FormClienteProps {
  onSubmit: (cliente: ClienteInput) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
  mode?: "create" | "edit";
  initialValues?: Partial<ClienteInput>;
}

const FormCliente = ({
  onSubmit,
  onCancel,
  loading = false,
  mode = "create",
  initialValues,
}: FormClienteProps) => {
  const [nombre, setNombre] = useState(initialValues?.nombre ?? "");
  const [apellidos, setApellidos] = useState(initialValues?.apellidos ?? "");
  const [telefono, setTelefono] = useState(initialValues?.telefono ?? "");
  const [email, setEmail] = useState(initialValues?.email ?? "");

  const isEditMode = mode === "edit";

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const payload = {
      nombre: nombre.trim(),
      apellidos: apellidos.trim(),
      telefono: telefono.trim() || undefined,
      email: email.trim() || undefined,
    };

    if (!payload.nombre || !payload.apellidos) {
      return;
    }

    await onSubmit(payload);

    if (!isEditMode) {
      setNombre("");
      setApellidos("");
      setTelefono("");
      setEmail("");
    }
  };

  return (
    <form className="form-cliente" onSubmit={handleSubmit}>
      <h2 className="form-cliente-title">
        {isEditMode ? "Editar cliente" : "Crear cliente"}
      </h2>

      <input
        className="form-cliente-input"
        type="text"
        placeholder="Nombre"
        value={nombre}
        onChange={(event) => setNombre(event.target.value)}
        required
      />
      <input
        className="form-cliente-input"
        type="text"
        placeholder="Apellidos"
        value={apellidos}
        onChange={(event) => setApellidos(event.target.value)}
        required
      />
      <input
        className="form-cliente-input"
        type="email"
        placeholder="Correo electrónico"
        value={email}
        onChange={(event) => setEmail(event.target.value)}
      />
      <input
        className="form-cliente-input"
        type="tel"
        placeholder="Teléfono"
        value={telefono}
        onChange={(event) => setTelefono(event.target.value)}
      />

      <div className="form-cliente-actions">
        <button className="form-cliente-cancel" type="button" onClick={onCancel} disabled={loading}>
          Cancelar
        </button>
        <button className="form-cliente-submit" type="submit" disabled={loading}>
          {loading
            ? isEditMode
              ? "Guardando..."
              : "Creando..."
            : isEditMode
              ? "Guardar cambios"
              : "Crear cliente"}
        </button>
      </div>
    </form>
  );
};

export default FormCliente;