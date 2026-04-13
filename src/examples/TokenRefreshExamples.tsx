// Ejemplos de cómo usar el sistema de Auto-Refresh de Token

import { useEffect, useRef, useState } from 'react';
import { useAuth } from '../auth/useAuth';
import { getTimeUntilExpiry, isTokenExpiringIn } from '../services/tokenManager';
import { useTokenLifetime, useUserValidation } from './useTokenHooks';

/**
 * EJEMPLO 1: Monitorear el tiempo restante del token
 */
export function ExampleTokenMonitor() {
  const { token } = useAuth();

  if (!token) return <p>No autenticado</p>;

  const timeLeft = getTimeUntilExpiry(token);
  const expiringIn5Mins = isTokenExpiringIn(token, 300);

  return (
    <div>
      <p>Tiempo restante: {timeLeft} segundos</p>
      {expiringIn5Mins && <p>⚠️ El token está por expirar</p>}
    </div>
  );
}

/**
 * EJEMPLO 2: Badge de estado de sesión
 * Muestra un indicador que cambia cuando el token se renueva
 */
export function SessionStatusBadge() {
  const { token } = useAuth();
  const [isRefreshed, setIsRefreshed] = useState(false);
  const prevTokenRef = useRef(token);

  useEffect(() => {
    if (token !== prevTokenRef.current && token) {
      setIsRefreshed(true);
      const timer = setTimeout(() => setIsRefreshed(false), 2000);
      prevTokenRef.current = token;
      return () => clearTimeout(timer);
    }
  }, [token]);

  if (!token) return null;

  return (
    <div className={`badge ${isRefreshed ? 'badge-success' : 'badge-neutral'}`}>
      {isRefreshed ? '✓ Sesión actualizada' : 'Sesión activa'}
    </div>
  );
}

/**
 * EJEMPLO 3: Dashboard con información de sesión
 */
export function Dashboard() {
  const { token } = useAuth();
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);
  const prevTokenRef = useRef(token);

  useEffect(() => {
    if (token !== prevTokenRef.current && token) {
      setLastRefresh(new Date());
      prevTokenRef.current = token;
    }
  }, [token]);

  if (!token) return <p>No autenticado</p>;

  const timeLeft = getTimeUntilExpiry(token);
  const minutes = Math.floor((timeLeft || 0) / 60);
  const seconds = (timeLeft || 0) % 60;

  return (
    <div className="dashboard">
      <h1>Dashboard</h1>
      
      <div className="session-info">
        <p>Sesión activa</p>
        {lastRefresh && (
          <small>
            Última renovación: {lastRefresh.toLocaleTimeString()}
          </small>
        )}
        <p className="timer">
          Expira en: {minutes}m {seconds}s
        </p>
      </div>

      {/* El resto del dashboard */}
    </div>
  );
}

/**
 * EJEMPLO 4: Notificación cuando el token se renueva
 * 
 * IMPORTANTE: Este ejemplo requiere que instales: npm install sonner
 * O usa tu propia librería de notificaciones (Toast, etc)
 */
export function TokenRefreshNotifier() {
  const { token } = useAuth();

  useEffect(() => {
    console.log('✓ Token renovado automáticamente');
    // Descomenta la siguiente línea si tienes sonner instalado:
    // toast.success('Tu sesión se ha renovado automáticamente', { duration: 3000 });
  }, [token]);

  return null;
}

/**
 * EJEMPLO 5: Componente que muestra un modal antes de desconectar
 * (Si quisieras implementar una renovación manual como opción)
 */
export function SessionExpirationWarning() {
  const { logout } = useAuth();
  const [showWarning, setShowWarning] = useState(false);
  const { isExpiringSoon } = useTokenLifetime();

  useEffect(() => {
    setShowWarning(isExpiringSoon);
  }, [isExpiringSoon]);

  if (!showWarning) return null;

  return (
    <div className="modal">
      <div className="modal-content">
        <h2>Sesión próxima a expirar</h2>
        <p>
          Tu sesión se está renovando automáticamente.
          No necesitas hacer nada.
        </p>
        <button onClick={() => setShowWarning(false)}>
          OK
        </button>
        <button onClick={logout}>
          Cerrar sesión
        </button>
      </div>
    </div>
  );
}

/**
 * EJEMPLO 6: Componente que valida periódicamente al usuario
 * Sincroniza datos del usuario del servidor cada 5 minutos
 */
export function UserValidationIndicator() {
  const { user } = useAuth();
  const { isValidating, lastValidation, validationError } = useUserValidation(300); // 5 minutos

  if (!user) return null;

  return (
    <div className="validation-indicator">
      <div className="user-info">
        <p>Logged in as: {user.nombre} {user.apellidos}</p>
        <p className="user-email">Email: {user.email}</p>
      </div>

      <div className="validation-status">
        {isValidating && (
          <span className="status validating">⟳ Sincronizando datos...</span>
        )}
        {validationError && (
          <span className="status error">✗ Error: {validationError}</span>
        )}
        {lastValidation && !isValidating && (
          <span className="status success">
            ✓ Datos actualizados: {lastValidation.toLocaleTimeString()}
          </span>
        )}
      </div>
    </div>
  );
}

/**
 * USO EN APLICACIÓN PRINCIPAL
 * 
 * Agrega estos componentes a tu App.tsx o Layout principal:
 * 
 * 1. Importa los componentes:
 *    import { 
 *      SessionStatusBadge, 
 *      Dashboard,
 *      TokenRefreshNotifier,
 *      SessionExpirationWarning,
 *      UserValidationIndicator
 *    } from '@/examples/TokenRefreshExamples';
 * 
 * 2. Agrégalos en tu componente:
 *    - SessionStatusBadge: En el header para mostrar estado de sesión
 *    - UserValidationIndicator: En el header para mostrar datos del usuario
 *    - TokenRefreshNotifier: En root para notificar renovaciones
 *    - SessionExpirationWarning: En root para mostrar advertencias
 * 
 * Ejemplo:
 * function App() {
 *   return (
 *     <>
 *       <Header>
 *         <SessionStatusBadge />
 *         <UserValidationIndicator />
 *       </Header>
 *       <TokenRefreshNotifier />
 *       <SessionExpirationWarning />
 *       <MainContent />
 *     </>
 *   );
 * }
 */

/**
 * MONITOREO EN DESARROLLO
 * 
 * Agrega esto en la consola del navegador para ver logs en tiempo real:
 */
// En src/services/https.ts, agregar antes de los interceptores:
/*
if (import.meta.env.DEV) {
  console.log('[Token Refresh System] Inicializado');
}
*/

/**
 * DEPURACIÓN
 * 
 * Para ver cuándo se renuevan los tokens:
 */
// En DevTools Console:
/*
// Ver token actual
JSON.parse(localStorage.getItem('leadchain_auth')).token

// Ver expiración
import { getTokenExpirationTime, getTimeUntilExpiry } from '@/services/tokenManager'
const token = JSON.parse(localStorage.getItem('leadchain_auth')).token
getTimeUntilExpiry(token) // segundos restantes
getTokenExpirationTime(token) // timestamp de expiración
*/
