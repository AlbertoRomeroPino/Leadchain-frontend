
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
