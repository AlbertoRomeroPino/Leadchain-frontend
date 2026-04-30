import React, { useState, useMemo, useCallback, memo } from "react";
import type { User, UserUpdateInput, UserInput, Zona } from "../../types";
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

// 1. OPTIMIZACIÓN: React.memo para bloquear renders innecesarios desde el padre
const ComercialesForm = memo(({
  zonas,
  comerciales,
  comercialAEditar = null,
  onSuccess,
}: ComercialesFormProps) => {
  const [formData, setFormData] = useState({
    nombre: comercialAEditar?.nombre || "",
    apellidos: comercialAEditar?.apellidos || "",
    email: comercialAEditar?.email || "",
    password: "",
    id_zona: comercialAEditar?.id_zona?.toString() || "",
  });
  const [isLoading, setIsLoading] = useState(false);

  const esEdicion = !!comercialAEditar;

  // Memoizamos el filtrado de zonas para optimizar el renderizado
  const zonasDisponibles = useMemo(() => {
    const zonasAsignadas = new Set(
      comerciales
        .filter((cliente) => cliente.id !== comercialAEditar?.id)
        .map((cliente) => cliente.id_zona),
    );
    return zonas.filter((zona) => !zonasAsignadas.has(zona.id));
  }, [zonas, comerciales, comercialAEditar?.id]); // Usamos .id explícitamente en dependencias

  // 2. OPTIMIZACIÓN: useCallback y limpieza de nombre de variable (adiós "edificio")
  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  }, []);

  // 3. OPTIMIZACIÓN: useCallback para el submit, validación integrada y lectura perezosa de storage
  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();

    // LECTURA DIFERIDA: Solo leemos el storage cuando realmente vamos a guardar,
    // liberando el hilo principal durante la escritura (typing) del usuario.
    const session = authStorage.get();
    const currentUserId = session?.user?.id ?? null;

    if (!currentUserId) {
      showErrorAlert("No se pudo identificar al usuario actual (sesión inválida)");
      return;
    }

    // Validación inline para evitar crear otra función separada en memoria
    const errors: string[] = [];
    if (!formData.nombre.trim()) errors.push("Nombre es requerido");
    if (!formData.email.trim()) errors.push("Email es requerido");
    if (!formData.id_zona) errors.push("Zona debe estar seleccionada");

    const pass = formData.password;
    if (!esEdicion && !pass) errors.push("Contraseña es requerida");
    if (pass && pass.length < 8) {
      errors.push("Contraseña debe tener al menos 8 caracteres");
    }

    if (errors.length > 0) {
      showValidationError(errors.join(", "));
      return;
    }

    try {
      setIsLoading(true);

      let result: User;
      if (esEdicion && comercialAEditar) {
        const updateData: UserUpdateInput = {
          nombre: formData.nombre,
          apellidos: formData.apellidos,
          email: formData.email,
          id_zona: parseInt(formData.id_zona),
          ...(formData.password && { password: formData.password }),
        };
        result = await UserService.updateUser(comercialAEditar.id, updateData);
      } else {
        const createData: UserInput = {
          nombre: formData.nombre,
          apellidos: formData.apellidos,
          email: formData.email,
          password: formData.password,
          rol: "comercial",
          id_responsable: currentUserId,
          id_zona: parseInt(formData.id_zona),
        };
        result = await UserService.createUser(createData);
      }

      showSuccessAlert(esEdicion ? "Comercial actualizado" : "Comercial creado");
      onSuccess?.(result);
      
    } catch (err) {
      showErrorAlert(err, esEdicion ? "Actualizar Comercial" : "Crear Comercial");
    } finally {
      setIsLoading(false);
    }
  }, [formData, esEdicion, comercialAEditar, onSuccess]);

  return (
    <div className="comerciales-form-wrapper">
      <h2 className="comerciales-form-title">
        {esEdicion ? "Editar comercial" : "Nuevo comercial"}
      </h2>
      <form className="comerciales-form" onSubmit={handleSubmit}>
        <label className="comerciales-form-field">
          <span>Nombre</span>
          <input
            name="nombre"
            value={formData.nombre}
            onChange={handleChange}
            maxLength={50}
            disabled={isLoading}
          />
        </label>
        <label className="comerciales-form-field">
          <span>Apellidos</span>
          <input
            name="apellidos"
            value={formData.apellidos}
            onChange={handleChange}
            maxLength={100}
            disabled={isLoading}
          />
        </label>
        <label className="comerciales-form-field">
          <span>Email</span>
          <input
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            disabled={isLoading}
          />
        </label>
        <label className="comerciales-form-field">
          <span>Contraseña {esEdicion && "(opcional)"}</span>
          <input
            name="password"
            type="password"
            value={formData.password}
            onChange={handleChange}
            disabled={isLoading}
            placeholder={esEdicion ? "Dejar en blanco para no cambiar" : ""}
          />
        </label>
        <label className="comerciales-form-field">
          <span>Zona</span>
          <select
            name="id_zona"
            value={formData.id_zona}
            onChange={handleChange}
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
              ? "Actualizar"
              : "Crear"}
        </button>
      </form>
    </div>
  );
});

ComercialesForm.displayName = "ComercialesForm";

export default ComercialesForm;