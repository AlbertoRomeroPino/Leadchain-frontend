import React, { useState } from "react";
import type { UserInput, User, UserUpdateInput, Zona } from "../../types";
import { UserService } from "../../services/UserService";
import { authStorage } from "../../auth/authStorage";
import {
  showErrorAlert,
  showSuccessAlert,
  showValidationError,
} from "../utils/errorHandler";
import "../../styles/components/Comerciales/ComercialesForm.css";

interface ComercialesFormProps {
  zonas: Zona[];
  comerciales: User[];
  comercialAEditar?: User | null;
  onSuccess?: (comercial: User) => void;
}

const ComercialesForm = ({ zonas, comerciales, comercialAEditar = null, onSuccess }: ComercialesFormProps) => {
  // Obtener IDs de zonas ya asignadas a otros comerciales
  const zonasAsignadas = new Set(
    comerciales
      .filter((c) => c.id !== comercialAEditar?.id) // Excluir el comercial que se está editando
      .map((c) => c.id_zona)
  );

  // Filtrar zonas disponibles (excluir las ya asignadas)
  const zonasDisponibles = zonas.filter((zona) => !zonasAsignadas.has(zona.id));
  const [nombre, setNombre] = useState(comercialAEditar?.nombre || "");
  const [apellidos, setApellidos] = useState(comercialAEditar?.apellidos || "");
  const [email, setEmail] = useState(comercialAEditar?.email || "");
  const [password, setPassword] = useState("");
  const [zonaSeleccionada, setZonaSeleccionada] = useState(
    comercialAEditar?.id_zona?.toString() || ""
  );
  const [isLoading, setIsLoading] = useState(false);
  const esEdicion = !!comercialAEditar;

  const session = authStorage.get();
  const currentUserId = session?.user?.id ?? null;

  const validateForm = () => {
    const errors: string[] = [];
    const nombreTrim = nombre.trim();
    const apellidosTrim = apellidos.trim();

    if (!nombreTrim) errors.push("Nombre es requerido");
    if (nombreTrim.length > 50) errors.push("Nombre no puede tener más de 50 caracteres");
    if (apellidosTrim.length > 100) errors.push("Apellidos no puede tener más de 100 caracteres");
    if (!email.trim()) errors.push("Email es requerido");
    if (!zonaSeleccionada) errors.push("Zona debe estar seleccionada");

    if (!esEdicion) {
      if (!password) errors.push("Contraseña es requerida");
      else if (password.length < 8) errors.push("Contraseña debe tener al menos 8 caracteres");
    } else {
      if (password && password.length < 8) errors.push("Contraseña debe tener al menos 8 caracteres");
    }

    if (errors.length > 0) {
      showValidationError(errors.join(", "));
    }

    return errors.length === 0;
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!validateForm()) {
      return;
    }

    if (!currentUserId) {
      return;
    }

    try {
      setIsLoading(true);
      let comercialResultado: User;

      if (esEdicion) {
        // Modo edición
        const usuarioActualizado: UserUpdateInput = {
          nombre,
          apellidos,
          email,
          id_zona: parseInt(zonaSeleccionada) || null,
        };

        // Solo incluir contraseña si fue ingresada
        if (password) {
          usuarioActualizado.password = password;
        }

        comercialResultado = await UserService.updateUser(comercialAEditar!.id, usuarioActualizado);
      } else {
        // Modo creación
        const nuevoUsuario: UserInput = {
          nombre,
          apellidos,
          email,
          password,
          rol: "comercial",
          id_responsable: currentUserId,
          id_zona: parseInt(zonaSeleccionada) || null,
        };

        comercialResultado = await UserService.createUser(nuevoUsuario);
      }

      // Limpiar formulario
      setNombre("");
      setApellidos("");
      setEmail("");
      setPassword("");
      setZonaSeleccionada("");

      // Callback para cerrar modal y actualizar lista
      if (onSuccess) {
        onSuccess(comercialResultado);
      }
      showSuccessAlert(esEdicion ? "Comercial actualizado" : "Comercial creado");
    } catch (err) {
      showErrorAlert(err, esEdicion ? "Actualizar Comercial" : "Crear Comercial");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="comerciales-form-wrapper">
      <h2 className="comerciales-form-title">
        {esEdicion ? "Editar comercial" : "Nuevo comercial"}
      </h2>
      <form className="comerciales-form" onSubmit={handleSubmit}>
        <label className="comerciales-form-field">
          <span>Nombre</span>
          <input
            type="text"
            name="nombre"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            maxLength={50}
            disabled={isLoading}
          />
        </label>
        <label className="comerciales-form-field">
          <span>Apellidos</span>
          <input
            type="text"
            name="apellidos"
            value={apellidos}
            onChange={(e) => setApellidos(e.target.value)}
            maxLength={100}
            disabled={isLoading}
          />
        </label>
        <label className="comerciales-form-field">
          <span>Email</span>
          <input
            type="email"
            name="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={isLoading}
          />
        </label>
        <label className="comerciales-form-field">
          <span>Contraseña {esEdicion && "(opcional)"}</span>
          <input
            type="password"
            name="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={isLoading}
            placeholder={esEdicion ? "Dejar en blanco para no cambiar" : ""}
          />
        </label>
        <label className="comerciales-form-field">
          <span>Zona</span>
          <select
            name="zona"
            value={zonaSeleccionada}
            onChange={(e) => setZonaSeleccionada(e.target.value)}
            disabled={isLoading}
          >
            <option value="">Selecciona una zona</option>
            {zonasDisponibles.map((zona) => (
              <option key={zona.id} value={zona.id.toString()}>
                {zona.nombre}
              </option>
            ))}
          </select>
        </label>
        <button
          type="submit"
          className="comerciales-form-submit"
          disabled={isLoading}
        >
          {isLoading
            ? esEdicion
              ? "Actualizando..."
              : "Creando..."
            : esEdicion
              ? "Actualizar Comercial"
              : "Crear Comercial"}
        </button>
      </form>
    </div>
  );
      
};

export default ComercialesForm;
