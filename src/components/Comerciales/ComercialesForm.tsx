import React, { useState } from "react";
import type { Zona } from "../../types/zonas/Zona";
import type { UserInput, User, UserUpdateInput } from "../../types/users/User";
import { UserService } from "../../services/User";
import { authStorage } from "../../auth/authStorage";
import showStatusAlert from "../StatusAlert";

interface ComercialesFormProps {
  zonas: Zona[];
  comercialAEditar?: User | null;
  onSuccess?: (comercial: User) => void;
}

const ComercialesForm = ({ zonas, comercialAEditar = null, onSuccess }: ComercialesFormProps) => {
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

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    // En edición, la contraseña es opcional
    const camposRequired = esEdicion
      ? [nombre, apellidos, email, zonaSeleccionada]
      : [nombre, apellidos, email, password, zonaSeleccionada];

    if (camposRequired.some((campo) => !campo)) {
      showStatusAlert({
        type: "error",
        title: "Campos requeridos",
        description: "Por favor completa todos los campos",
      });
      return;
    }

    if (!currentUserId) {
      showStatusAlert({
        type: "error",
        title: "Usuario no autenticado",
        description: "No se pudo obtener el usuario actual",
      });
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

        showStatusAlert({
          type: "success",
          title: "Comercial actualizado",
          description: `${nombre} ${apellidos} ha sido actualizado correctamente`,
        });
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

        showStatusAlert({
          type: "success",
          title: "Comercial creado",
          description: `${nombre} ${apellidos} ha sido creado correctamente`,
        });
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
    } catch (err) {
      const message = err instanceof Error ? err.message : "Error desconocido";

      showStatusAlert({
        type: "error",
        title: esEdicion ? "Error al actualizar comercial" : "Error al crear comercial",
        description: message,
      });
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
            {zonas.map((zona) => (
              <option key={zona.id} value={zona.id.toString()}>
                {zona.nombre_zona}
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
