import { useState, useCallback, memo } from "react";
import type { ClienteInput } from "../../types";
import "../../styles/components/Clientes/ClienteForm.css";
import { showErrorAlert } from "../utils/errorHandler";

interface FormClienteProps {
  onSubmit: (cliente: ClienteInput) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
  mode?: "create" | "edit";
  initialValues?: Partial<ClienteInput>;
}

// 1. OPTIMIZACIÓN: memo() para evitar re-renderizados si el padre cambia pero las props de este form no.
const FormCliente = memo(({
  onSubmit,
  onCancel,
  loading = false,
  mode = "create",
  initialValues,
}: FormClienteProps) => {
  const isEditMode = mode === "edit";

  // 2. OPTIMIZACIÓN: Estado unificado. 
  // En lugar de 4 useStates distintos, usamos un solo objeto. Es más limpio y escala mejor.
  const [formData, setFormData] = useState({
    nombre: initialValues?.nombre ?? "",
    apellidos: initialValues?.apellidos ?? "",
    telefono: initialValues?.telefono ?? "",
    email: initialValues?.email ?? "",
  });

  // 3. OPTIMIZACIÓN: Manejador de eventos genérico y estabilizado (useCallback)
  // Reemplaza las 4 funciones anónimas en los onChange del return.
  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      // Aplicamos el filtro de números para el teléfono directamente aquí
      [name]: name === "telefono" ? value.replace(/\D/g, "").slice(0, 15) : value,
    }));
  }, []);

  // 4. OPTIMIZACIÓN: useCallback para estabilizar el envío
  const handleSubmit = useCallback(async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const trimmedNombre = formData.nombre.trim();
    const trimmedApellidos = formData.apellidos.trim();

    const payload = {
      nombre: trimmedNombre,
      apellidos: trimmedApellidos === "" ? "Sin apellidos" : trimmedApellidos,
      telefono: formData.telefono.trim() || undefined,
      email: formData.email.trim() || undefined,
    };

    const errors: string[] = [];

    if (!trimmedNombre) {
      errors.push("Nombre es requerido");
    } else if (trimmedNombre.length > 50) {
      errors.push("Nombre no puede tener más de 50 caracteres");
    }

    if (trimmedApellidos.length > 100) {
      errors.push("Apellidos no puede tener más de 100 caracteres");
    }

    if (errors.length > 0) {
      showErrorAlert(errors.join("\n"));
      return;
    }

    await onSubmit(payload);

    if (!isEditMode) {
      // Reseteo limpio del objeto completo
      setFormData({ nombre: "", apellidos: "", telefono: "", email: "" });
    }
  }, [formData, isEditMode, onSubmit]);

  return (
    <form className="form-cliente" onSubmit={handleSubmit}>
      <h2 className="form-cliente-title">
        {isEditMode ? "Editar cliente" : "Crear cliente"}
      </h2>

      <input
        className="form-cliente-input"
        type="text"
        name="nombre" // Añadido atributo name para el handleChange dinámico
        placeholder="Nombre"
        value={formData.nombre}
        onChange={handleChange}
        maxLength={50}
        required
      />
      <input
        className="form-cliente-input"
        type="text"
        name="apellidos"
        placeholder="Apellidos (opcional)"
        value={formData.apellidos}
        onChange={handleChange}
        maxLength={100}
      />
      <input
        className="form-cliente-input"
        type="email"
        name="email"
        placeholder="Correo electrónico"
        value={formData.email}
        onChange={handleChange}
      />
      <input
        className="form-cliente-input"
        type="tel"
        name="telefono"
        inputMode="numeric"
        pattern="[0-9]*"
        placeholder="Teléfono"
        value={formData.telefono}
        onChange={handleChange}
        maxLength={15}
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
});

FormCliente.displayName = "FormCliente";

export default FormCliente;