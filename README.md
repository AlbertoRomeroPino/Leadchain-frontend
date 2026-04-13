# Cosas para enviar en la misma red:

# Composer.json

```json
"dev": [
            "Composer\\Config::disableProcessTimeout",
            "npx concurrently -c \"#93c5fd,#c4b5fd,#fb7185,#fdba74\" \"php artisan serve --host=0.0.0.0 --port=8000\" \"php artisan queue:listen --tries=1 --timeout=0\" \"php artisan pail --timeout=0\" \"npm run dev\" --names=server,queue,logs,vite --kill-others"
        ],
```

# .env

```json
VITE_API_BASE_URL=/
```

# .env.dist

```json
VITE_API_BASE_URL=/
```

# .env.local

```json
VITE_API_BASE_URL=/
```

# package.json

```json
"scripts": {
    "dev": "vite --host",
    "build": "tsc -b && vite build",
    "lint": "eslint .",
    "preview": "vite preview --host"
  },
```

# https.ts

```json
import axios from "axios";
import type { AuthSession } from "../types/users/User";
import { authStorage } from "../auth/authStorage";

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL as string | undefined)?.trim() || "/";

```

# Vite.config.ts

```json
export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
        secure: false,
      },
      '/sanctum': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
        secure: false,
      },
    },
  },
})
```


```plantuml
sequenceDiagram
    participant User as Usuario
    participant App as Aplicación
    participant HTTP as Interceptor HTTP
    participant API as API Backend
    participant Storage as LocalStorage
    participant Context as React Context

    User->>App: Navega / Hace clic
    App->>HTTP: Solicitud HTTP
  
    rect rgb(200, 230, 201)
        Note over HTTP: Check Token
        HTTP->>HTTP: ¿Token expira en <5 min?
        alt Sí (próximo a expirar)
            HTTP->>HTTP: Marcar para monitoreo
        end
    end
  
    HTTP->>API: GET + Bearer Token
  
    rect rgb(255, 243, 224)
        Note over API: Respuesta del servidor
        alt Status 200 (OK)
            API-->>HTTP: ✅ Respuesta exitosa
        else Status 401 (Expirado!)
            API-->>HTTP: ❌ 401 Unauthorized
  
            rect rgb(255, 225, 225)
                Note over HTTP: Auto-Refresh Activado
                HTTP->>HTTP: ¿Ya reintenté?<br/>(evita bucle infinito)
                alt No
                    HTTP->>API: POST /api/auth/refresh
                    API-->>HTTP: ✅ Nuevo Token
                    HTTP->>Storage: 💾 Guardar nuevo token
                    HTTP->>Context: 🔄 Notificar renovación
                    Context->>Context: Actualizar estado
                    HTTP->>API: Reintentar solicitud original
                    API-->>HTTP: ✅ Respuesta
                end
            end
        end
    end
  
    HTTP-->>App: Respuesta completa
    App-->>User: ✨ Sesión intacta, sin interrupciones



```
