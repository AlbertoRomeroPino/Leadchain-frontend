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
