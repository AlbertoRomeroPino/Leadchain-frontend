
import React, { useState } from "react";
import type { Zona } from "../../types/zonas/Zona";
import type { UserInput } from "../../types/users/User";
import { UserService } from "../../services/User";
import { authStorage } from "../../auth/authStorage";
import showStatusAlert from "../StatusAlert";

interface ComercialesFormProps {
  zonas: Zona[];
  onSuccess?: () => void;
}

const ComercialesForm = ({ zonas, onSuccess }: ComercialesFormProps) => {
  const [nombre, setNombre] = useState("");
  const [apellidos, setApellidos] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [zonaSeleccionada, setZonaSeleccionada] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const session = authStorage.get();
  const currentUserId = session?.user?.id ?? null;

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!nombre || !apellidos || !email || !password || !zonaSeleccionada) {
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
// TODO: quitar comentarios
    try {
      setIsLoading(true);

      const nuevoUsuario: UserInput = {
        nombre,
        apellidos,
        email,
        password,
        rol: "comercial",
        id_responsable: currentUserId,
        id_zona: parseInt(zonaSeleccionada) || null,
      };

      console.log("📤 Enviando al backend:", nuevoUsuario);

      const respuesta = await UserService.createUser(nuevoUsuario);

      console.log("✅ Respuesta del backend:", respuesta);

      showStatusAlert({
        type: "success",
        title: "Comercial creado",
        description: `${nombre} ${apellidos} ha sido creado correctamente`,
      });

      // Limpiar formulario
      setNombre("");
      setApellidos("");
      setEmail("");
      setPassword("");
      setZonaSeleccionada("");

      // Callback para cerrar modal o refrescar lista
      if (onSuccess) {
        onSuccess();
      }
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Error desconocido";
      console.error("❌ Error al crear comercial:", message);

      showStatusAlert({
        type: "error",
        title: "Error al crear comercial",
        description: message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="comerciales-form-wrapper">
      <h2 className="comerciales-form-title">Nuevo comercial</h2>
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
          <span>Contraseña</span>
          <input
            type="password"
            name="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={isLoading}
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
          {isLoading ? "Creando..." : "Crear Comercial"}
        </button>
      </form>
    </div>
  );
};

export default ComercialesForm;
