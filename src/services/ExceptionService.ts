export class ExceptionService {
  static getErrorMessage(error: unknown, fallback: string): string {
    if (typeof error === "object" && error !== null && "response" in error) {
      const axiosError = error as {
        response?: { data?: { message?: string } };
        message?: string;
      };

      if (axiosError.response?.data?.message) {
        return axiosError.response.data.message;
      }

      if (axiosError.message) {
        return axiosError.message;
      }
    }

    if (error instanceof Error) {
      return error.message;
    }

    return fallback;
  }
}

/**
 * Helper para envolver llamadas a servicios con manejo de errores uniforme
 * Ejecuta la función y lanza un Error normalizado si falla
 */
export async function wrapServiceCall<T>(
  fn: () => Promise<T>,
  errorMessage: string
): Promise<T> {
  try {
    return await fn();
  } catch (error) {
    throw new Error(ExceptionService.getErrorMessage(error, errorMessage));
  }
}
