/**
 * Utilidad para gestionar tokens JWT
 * - Decodificar JWT
 * - Detectar expiración
 * - Calcular tiempo restante
 */

interface JWTPayload {
  exp?: number;
  iat?: number;
  [key: string]: unknown;
}

/**
 * Decodifica un JWT sin validación de firma
 * (para obtener información de expiración)
 */
export function decodeJWT(token: string): JWTPayload | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;

    // Decodificar el payload (segunda parte)
    const payload = parts[1];
    // Agregar padding si es necesario
    const padded = payload + "=".repeat((4 - (payload.length % 4)) % 4);
    const decoded = atob(padded);
    return JSON.parse(decoded) as JWTPayload;
  } catch {
    return null;
  }
}

/**
 * Obtiene el tiempo de expiración del token en segundos
 */
export function getTokenExpirationTime(token: string): number | null {
  const payload = decodeJWT(token);
  return payload?.exp ?? null;
}

/**
 * Verifica si el token está expirado
 */
export function isTokenExpired(token: string): boolean {
  const expirationTime = getTokenExpirationTime(token);
  if (!expirationTime) return false;

  const currentTime = Math.floor(Date.now() / 1000);
  return currentTime >= expirationTime;
}

/**
 * Verifica si el token expirará en los próximos N segundos
 * @param token Token JWT
 * @param secondsBeforeExpiry Segundos antes de la expiración (default: 300 = 5 minutos)
 */
export function isTokenExpiringIn(
  token: string,
  secondsBeforeExpiry: number = 300
): boolean {
  const expirationTime = getTokenExpirationTime(token);
  if (!expirationTime) return false;

  const currentTime = Math.floor(Date.now() / 1000);
  const timeRemaining = expirationTime - currentTime;

  return timeRemaining <= secondsBeforeExpiry;
}

/**
 * Obtiene los segundos restantes hasta la expiración
 */
export function getTimeUntilExpiry(token: string): number | null {
  const expirationTime = getTokenExpirationTime(token);
  if (!expirationTime) return null;

  const currentTime = Math.floor(Date.now() / 1000);
  const timeRemaining = expirationTime - currentTime;

  return timeRemaining > 0 ? timeRemaining : 0;
}
