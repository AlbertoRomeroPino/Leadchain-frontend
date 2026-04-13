# Sistema de Auto-Refresh de Token

## 📋 Resumen

Se ha implementado un sistema automático de renovación de tokens (JWT) que mantiene la sesión del usuario activa sin interrupciones mientras navega en la aplicación.

## 🎯 Cómo funciona

### 1. **Detección de Expiración**

- Cuando se envía una solicitud HTTP, el interceptor verifica si el token expirará en menos de **5 minutos**
- Si está próximo a expirar, el token se marca para monitoreo

### 2. **Respuesta 401 (No Autorizado)**

- Si el servidor responde con 401, significa que el token expiró
- El sistema automáticamente intenta renovarlo usando el endpoint `/api/auth/refresh`
- La solicitud original se reintenta con el nuevo token

### 3. **Sincronización de Estado**

- Cuando el token se renueva, el estado de React (Context) se actualiza automáticamente
- El nuevo token se almacena en localStorage

## 📁 Archivos Modificados/Creados

### `src/services/tokenManager.ts` (NUEVO)

Utilidades para trabajar con JWT:

- `decodeJWT(token)` - Decodifica el payload sin validar firma
- `getTokenExpirationTime(token)` - Obtiene timestamp de expiración
- `isTokenExpired(token)` - Verifica si el token está expirado
- `isTokenExpiringIn(token, seconds)` - Verifica si expirará en N segundos
- `getTimeUntilExpiry(token)` - Calcula segundos restantes

**Uso:**

```typescript
import { isTokenExpiringIn, getTimeUntilExpiry } from '@/services/tokenManager';

const expiringIn5Mins = isTokenExpiringIn(token, 300);
const secondsLeft = getTimeUntilExpiry(token);
```

### `src/services/https.ts` (MODIFICADO)

**Cambios principales:**

1. **Nuevo callback `onTokenRefreshed`**

   ```typescript
   export function setAuthCallbacks(callbacks: {
     onUnauthorized: () => void;
     onTokenRefreshed?: (token: string) => void;  // NUEVO
   })
   ```
2. **Función `attemptTokenRefresh()`**

   - Llama a `authService.refresh()` cuando el token expira
   - Evita múltiples refresh simultáneos usando Promise caching
   - Actualiza localStorage y axios headers
   - Notifica al Context mediante `onTokenRefreshed`
3. **Interceptor de request mejorado**

   - Detecta tokens próximos a expirar (5 minutos antes)
   - Marca la solicitud para monitoreo
4. **Interceptor de response mejorado**

   - Detecta errors 401
   - Llama automáticamente a `attemptTokenRefresh()`
   - Reintenta la solicitud original con el nuevo token
   - Evita bucles infinitos con flag `__refreshRetried`

### `src/auth/authProvider.tsx` (MODIFICADO)

```typescript
// Ahora sincroniza cuando el token se renueva automáticamente
useEffect(() => {
  setAuthCallbacks({
    onUnauthorized: () => logout(),
    onTokenRefreshed: (newToken) => setToken(newToken), // NUEVO
  });
}, [logout]);
```

## 🔄 Flujo de Ejecución

```
Usuario hace una solicitud HTTP
        ↓
Interceptor de REQUEST
  - Agrega token al header
  - Verifica expiración (¿expira en <5 mins?)
  - Si sí, marca para monitoreo
        ↓
Servidor responde
        ↓
Interceptor de RESPONSE
  - ¿Estatus 401?
    ├─ Sí → Llamar attemptTokenRefresh()
    │       ├─ Llama /api/auth/refresh
    │       ├─ Guarda nuevo token
    │       ├─ Notifica Context (onTokenRefreshed)
    │       └─ Reintenta solicitud original
    └─ No → Retorna respuesta normal
        ↓
Solicitud completa (sin interrupciones para el usuario)
```

## ⚙️ Configuración

### Umbral de expiración (5 minutos por defecto)

Para cambiar el tiempo en que se detecta la expiración, edita en `src/services/https.ts`:

```typescript
// Cambiar 300 (5 minutos) a otro valor en segundos
if (isTokenExpiringIn(session.token, 300)) {  // ← Aquí
```

### Control de errores

Si el refresh falla múltiples veces:

1. Se limpia la autenticación (`authStorage.clear()`)
2. Se llama `onUnauthorized()`
3. Se redirige a `/Login`

## 🛡️ Características de Seguridad

✅ **Evita circularidad:** Importa `authService` dinámicamente para evitar dependencias circulares

✅ **Una sola renovación simultánea:** Usa `refreshPromise` para evitar múltiples llamadas concurrentes al endpoint de refresh

✅ **Reintentos limitados:** Flag `__refreshRetried` evita bucles infinitos

✅ **Storage sincronizado:** Token se actualiza en localStorage automáticamente

✅ **Context sincronizado:** React State se actualiza sin necesidad de refrescar la página

## 📊 Ventajas

| Antes                                     | Después                                    |
| ----------------------------------------- | ------------------------------------------- |
| Usuario se desconecta cuando expira token | Usuario permanece conectado mientras navega |
| Debe iniciar sesión de nuevo             | Token se renueva transparentemente          |
| Experiencia interrumpida                  | Experiencia fluida y sin interrupciones     |
| Error 401 no manejado                     | Error 401 dispara refresh automático       |

## 🧪 Pruebas Manuales

1. **Verifica que el token se renueva:**

   ```javascript
   // En DevTools Console:
   console.log(JSON.parse(localStorage.getItem('leadchain_auth')).token)
   // Espera 5+ minutos
   // Haz una solicitud HTTP (navega a otra página)
   // Verifica que el token cambió
   ```
2. **Prueba con token caducado:**

   - Modifica el token en localStorage a un valor inválido
   - Haz una solicitud HTTP
   - Debería redirigirse a `/Login`
3. **Monitorea en DevTools:**

   - Abre Network tab
   - Busca solicitudes a `/api/auth/refresh`
   - Deberían aparecer cuando el token esté próximo a expirar

## 🚀 Próximas mejoras (Opcional)

- Agregar método `authService.preRefresh()` para renovar el token antes de que expire
- Implementar UI para avisar al usuario que su sesión se renovó
- Agregar logging detallado en desarrollo
- Implementar estrategia de "silent" refresh en workers/timers
