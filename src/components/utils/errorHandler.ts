import showStatusAlert from "./StatusAlert";
import type { AxiosError } from "axios";

/**
 * Simplifica mensajes de error para mostrar al usuario
 * - Errores de BD → "Error de base de datos"
 * - Errores de validación → "Revisa los datos ingresados"
 * - Errores de red → "Error de conexión"
 * - Otros → "Algo salió mal"
 */
export function getSimplifiedErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    const message = error.message.toLowerCase();

    // Errores de base de datos
    if (
      message.includes("database") ||
      message.includes("db") ||
      message.includes("query")
    ) {
      return "Error de base de datos";
    }

    // Errores de validación/formulario
    if (
      message.includes("validation") ||
      message.includes("required") ||
      message.includes("invalid") ||
      message.includes("format") ||
      message.includes("field")
    ) {
      return "Revisa los datos ingresados";
    }

    // Errores de red/conexión
    if (
      message.includes("network") ||
      message.includes("connection") ||
      message.includes("timeout") ||
      message.includes("econnrefused")
    ) {
      return "Error de conexión";
    }

    // Errores de autenticación
    if (message.includes("unauthorized") || message.includes("not allowed")) {
      return "No tienes permisos para esta acción";
    }
  }

  // Error de Axios
  const axiosError = error as AxiosError;
  if (axiosError?.response) {
    const status = axiosError.response.status;

    if (status === 500 || status === 502 || status === 503) {
      return "Error de base de datos";
    }

    if (status === 400) {
      return "Revisa los datos ingresados";
    }

    if (status === 401) {
      return "No autenticado";
    }

    if (status === 403) {
      return "No tienes permisos para esta acción";
    }

    if (status === 404) {
      return "Recurso no encontrado";
    }
  }

  // Fallback
  return "Algo salió mal";
}

/**
 * Muestra un error de forma simplificada usando StatusAlert
 * No muestra mensajes técnicos complejos
 * Nota: Sileo aplica Title Case a los títulos, por eso usamos títulos cortos
 */
export function showErrorAlert(
  error: unknown,
  customTitle?: string,
  duration = 4000
) {
  const message = getSimplifiedErrorMessage(error);
  // Si no hay título custom, usar "Error" (una palabra, se ve bien con Title Case)
  // Si hay, esperamos que sea corto (ej: "Guardar" o "Eliminar", no "Error al guardar datos")
  const title = customTitle || "Error";

  showStatusAlert({
    type: "error",
    title,
    description: message,
    duration,
  });

  // Log del error original para debugging en consola
  console.error("Error details:", error);
}

/**
 * Muestra un error de validación específico
 */
export function showValidationError(fieldName: string, duration = 4000) {
  showStatusAlert({
    type: "error",
    title: "Validación",
    description: `El campo "${fieldName}" es inválido`,
    duration,
  });
}

/**
 * Muestra un mensaje de éxito
 */
export function showSuccessAlert(title: string, duration = 2000) {
  showStatusAlert({
    type: "success",
    title,
    duration,
  });
}

/**
 * Muestra un mensaje de advertencia
 */
export function showWarningAlert(title: string, duration = 3000) {
  showStatusAlert({
    type: "warning",
    title,
    duration,
  });
}

/**
 * Muestra un mensaje de información
 */
export function showInfoAlert(title: string, duration = 3000) {
  showStatusAlert({
    type: "info",
    title,
    duration,
  });
}

/**
 * Muestra un mensaje de carga
 */
export function showLoadingAlert(title: string) {
  showStatusAlert({
    type: "loading",
    title,
    duration: 50000,
  });
}
