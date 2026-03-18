
# PROTOCOLO DE ORGANIZACIÓN DE ACTIVOS Y JERARQUÍA DE DIRECTORIOS: LEADCHAIN-FRONTEND

La presente disposición documental detalla la estructura sistémica del proyecto, armonizando la metodología de organización de activos previos con las necesidades operativas de la plataforma de gestión de visitas.

Leadchain-frontend/
│
├── public/                         # Repositorio de activos estáticos de acceso público
│   └── icons/                      # Iconografía técnica y elementos de identidad visual
│
│
├── src/                            # Núcleo de implementación del código fuente
│   │
│   ├── auth/                       # Segmento especializado en la seguridad y persistencia de identidad
│   │   ├── authContext.tsx         # Orquestador del estado de autenticación de los sujetos
│   │   └── authStorage.ts          # Gestión de la persistencia local de credenciales (Tokens)
│   │
│   ├── components/                 # Unidades modulares de interfaz de usuario
│   │   ├── ButtonBackInicio.tsx    # Accionador de retorno al nodo de origen (Home)
│   │   ├── VisitCard.tsx           # Representación modular de registros de visitas
│   │   ├── VisitForm.tsx           # Módulo de captura de datos para nuevas incursiones
│   │   ├── ProtectedRoute.tsx      # Mecanismo de restricción de acceso por validación de rol
│   │   ├── RegisterForm.tsx        # Interfaz de alta de nuevos usuarios en el sistema
│   │   └── Seccion.tsx             # Contenedor semántico para la segmentación de contenidos
│   │
│   ├── context/                    # Proveedores de estado global de carácter transversal
│   │   └── GlobalStateContext.tsx  # Administración de estados de navegación y UI
│   │
│   ├── layout/                     # Estructuras de encuadre y plantillas de visualización
│   │   ├── AppLayout.tsx           # Marco operativo post-autenticación (Header, Sidebar, Footer)
│   │   └── AuthLayout.tsx          # Marco simplificado para procesos de acceso y registro
│   │
│   ├── pages/                      # Representaciones visuales de los nodos del diagrama
│   │   ├── LoginPage.tsx           # Interfaz de acceso al sistema
│   │   ├── RegisterPage.tsx        # Interfaz de registro de nuevos agentes
│   │   ├── AdminListPage.tsx       # Consola de gestión de registros administrativos
│   │   ├── VisitListPage.tsx       # Listado cronológico de visitas asignadas
│   │   ├── VisitDetailPage.tsx     # Información detallada del cliente y la infraestructura
│   │   ├── VisitFormPage.tsx       # Nodo de creación y edición de registros de campo
│   │   ├── PersonasCargoPage.tsx   # Visualización de la jerarquía de comerciales subordinados
│   │   ├── MapPage.tsx             # Representación cartográfica de activos y visitas
│   │   └── NotFoundPage.tsx        # Interfaz de excepción para rutas inexistentes (Error 404)
│   │
│   ├── services/                   # Abstracción de protocolos de comunicación con la API REST
│   │   ├── authService.ts          # Gestión de identidades y validación de sesiones
│   │   ├── visitService.ts         # Operaciones CRUD para el objeto visita
│   │   ├── userService.ts          # Gestión de datos del personal y subordinados
│   │   └── http.ts                 # Configuración del cliente HTTP y gestión de interceptores
│   │
│   ├── styles/                     # Repositorio de definiciones de estilo y diseño visual
│   │   ├── auth.css                # Estilística específica para módulos de autenticación
│   │   ├── layout.css              # Definiciones de espaciado y estructura de marcos (Padding)
│   │   ├── index.css               # Directivas de diseño global y tipografía
│   │   ├── variables.css           # Definición de tokens de color y constantes visuales
│   │   └── notfound.css            # Estilística para la página de error personalizada
│   │
│   ├── types/                      # Definiciones de modelos y contratos de tipado (TypeScript)
│   │   ├── User.ts                 # Especificación técnica del perfil de usuario y roles
│   │   └── Visit.ts                # Estructura de datos del registro de visita y edificio
│   │
│   ├── App.tsx                     # Orquestador central de la aplicación y rutas
│   └── main.tsx                    # Punto de inserción en el modelo de objetos del documento
│
│
├── .env                            # Variables de entorno y configuración de endpoints externos
├── package.json                    # Manifiesto de dependencias y scripts operativos
├── tsconfig.json                   # Configuración técnica del compilador de TypeScript
└── vite.config.ts                  # Parámetros del motor de desarrollo y empaquetado
