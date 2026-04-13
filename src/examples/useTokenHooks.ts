/**
 * Hooks personalizados para el sistema de Auto-Refresh de Token
 * Se separan en archivo aparte para evitar conflictos con Fast Refresh
 */

import { useEffect, useState } from 'react';
import { useAuth } from '../auth/useAuth';
import { getTimeUntilExpiry, isTokenExpiringIn } from '../services/tokenManager';

/**
 * Hook para monitorear el ciclo de vida del token
 * Retorna el tiempo restante y si está expirando pronto
 */
export function useTokenLifetime() {
  const { token } = useAuth();
  const [timeUntilExpiry, setTimeUntilExpiry] = useState<number | null>(null);
  const [isExpiringSoon, setIsExpiringSoon] = useState(false);

  useEffect(() => {
    if (!token) {
      return;
    }

    // Actualizar cada segundo
    const interval = setInterval(() => {
      const time = getTimeUntilExpiry(token);
      setTimeUntilExpiry(time);
      setIsExpiringSoon(isTokenExpiringIn(token, 300));
    }, 1000);

    return () => clearInterval(interval);
  }, [token]);

  return { timeUntilExpiry, isExpiringSoon };
}

/**
 * Hook para detectar cuando el token se renueva
 * Útil para mostrar notificaciones o logs
 */
export function useTokenRefreshNotification(onRefreshed?: () => void) {
  const { token: initialToken } = useAuth();
  const [prevToken, setPrevToken] = useState<string | null>(initialToken || null);

  useEffect(() => {
    if (initialToken && prevToken && initialToken !== prevToken) {
      // Token cambió = fue renovado automáticamente
      console.log('✓ Token renovado automáticamente');
      onRefreshed?.();
    }
  }, [initialToken, prevToken, onRefreshed]);

  useEffect(() => {
    setPrevToken(initialToken);
  }, [initialToken]);

  return { wasRefreshed: initialToken !== prevToken };
}

/**
 * Hook para validar periódicamente al usuario
 * Sincroniza datos del usuario del servidor cada X segundos
 * @param intervalSeconds Intervalo en segundos para validar (default: 300 = 5 minutos)
 */
export function useUserValidation(intervalSeconds: number = 300) {
  const { token, updateUser } = useAuth();
  const [isValidating, setIsValidating] = useState(false);
  const [lastValidation, setLastValidation] = useState<Date | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;

    // Función para validar usuario
    const validateUser = async () => {
      setIsValidating(true);
      try {
        const { authService } = await import('../services/authService');
        const updatedUser = await authService.me();
        updateUser(updatedUser);
        setLastValidation(new Date());
        setValidationError(null);
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Error validando usuario';
        setValidationError(message);
        console.warn('Error validando usuario:', error);
      } finally {
        setIsValidating(false);
      }
    };

    // Validar inmediatamente
    validateUser();

    // Configurar intervalo para validar periódicamente
    const interval = setInterval(validateUser, intervalSeconds * 1000);

    return () => clearInterval(interval);
  }, [token, updateUser, intervalSeconds]);

  return { isValidating, lastValidation, validationError };
}
