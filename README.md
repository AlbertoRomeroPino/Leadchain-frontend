Testeo de el toast Sileo.

```typescript
import { sileo, Toaster } from 'sileo';
import './App.css';

function App() {
  const handleShowNotification = () => {
    sileo.success({
      // Título principal de la notificación
      title: 'Operación Exitosa',
  
      // Descripción o contenido principal del mensaje
      description: '¡Tu zona ha sido creada correctamente!',
  
      // Tipo de notificación: "success" | "error" | "warning" | "info" | "loading" | "action"
      type: 'success',
  
      // Posición en pantalla: "top-left" | "top-center" | "top-right" | "bottom-left" | "bottom-center" | "bottom-right"
      position: 'top-center',
  
      // Duración en ms (null = permanente hasta que cierre el usuario)
      duration: 5000,
  
      // Icono personalizado (puede ser null o un ReactNode)
      // icon: null,
  
      // Color de fondo personalizado (hex, rgb, etc)
      // fill: '#10b981',
  
      // Redondez de las esquinas (en píxeles)
      // roundness: 8,
  
      // Estilos personalizados para elementos específicos
      styles: {
        title: 'font-bold text-lg',
        description: 'text-sm text-gray-700',
        badge: 'bg-green-100',
        button: 'font-semibold',
      },
  
      // Autopilot: expandir/contraer automáticamente con delays
      autopilot: {
        expand: 400,    // ms para expandirse
        collapse: 200,  // ms para contraerse
      },
  
      // Botón de acción dentro la notificación
      button: {
        title: 'Ver Detalles',
        onClick: () => console.log('Botón de sileo clickeado'),
      },
    });
  };

  return (
    <>
      <Toaster position='top-center' />
      <button onClick={handleShowNotification} style={{ padding: '10px 20px', fontSize: '16px' }}>
        Mostrar Notificación con Todos los Atributos
      </button>
    </>
  )
}

export default App

```


```sql
-- 1. PRIMERO: ZONAS (Nuevas IDs 5, 6, 7)
INSERT INTO zonas (id, nombre_zona, area, created_at, updated_at) VALUES 
(5, 'Sector Poniente - Ampliación', ST_GeomFromText('POLYGON((-4.7950 37.8850, -4.7850 37.8850, -4.7850 37.8750, -4.7950 37.8750, -4.7950 37.8850))', 4326), NOW(), NOW()),
(6, 'Polígono Industrial Chinales', ST_GeomFromText('POLYGON((-4.7700 37.9100, -4.7500 37.9100, -4.7500 37.9000, -4.7700 37.9000, -4.7700 37.9100))', 4326), NOW(), NOW()),
(7, 'Fátima - Levante', ST_GeomFromText('POLYGON((-4.7600 37.8950, -4.7500 37.8950, -4.7500 37.8850, -4.7600 37.8850, -4.7600 37.8950))', 4326), NOW(), NOW());

-- 2. SEGUNDO: USUARIOS (Nuevas IDs 5, 6, 7, 8)
-- Importante: El id_responsable es el 1 (tu admin original)
INSERT INTO users (id, nombre, apellidos, email, password, rol, id_zona, id_responsable, created_at, updated_at) VALUES 
(5, 'Elena', 'Belmonte de los Ríos', 'elena@leadchain.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'comercial', 4, 1, NOW(), NOW()),
(6, 'Roberto', 'Sanz Flotante', 'roberto@leadchain.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'comercial', 5, 1, NOW(), NOW()),
(7, 'Lucía', 'Méndez Castro', 'lucia@leadchain.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'comercial', 1, 1, NOW(), NOW()),
(8, 'Carlos', 'Torres Vega', 'carlos@leadchain.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'comercial', 6, 1, NOW(), NOW());

-- 3. TERCERO: CLIENTES (Nuevas IDs 5 a 10)
INSERT INTO clientes (id, nombre, apellidos, telefono, email, created_at, updated_at) VALUES 
(5, 'Talleres Córdoba S.L.', 'CIF B12345678', '957445566', 'contacto@talleres.es', NOW(), NOW()),
(6, 'Marta', 'Casas Rey', '633445566', 'marta@email.com', NOW(), NOW()),
(7, 'Restaurante El Pinar', 'CIF J112233', '957223344', 'reservas@elpinar.com', NOW(), NOW()),
(8, 'Sergio', 'Valle Inclán', '655778899', 'sergio@email.com', NOW(), NOW()),
(9, 'Inmobiliaria Sol', 'B88776655', '957667788', 'info@inmosol.es', NOW(), NOW()),
(10, 'Boutique Cordobesa', 'CIF G998877', '957112233', 'admin@boutique.com', NOW(), NOW());

-- 4. CUARTO: EDIFICIOS (Nuevas IDs 7 a 12)
INSERT INTO edificios (id, direccion_completa, planta, puerta, ubicacion, id_zona, tipo, id_cliente, created_at, updated_at) VALUES 
(7, 'Calle Góngora 4', '4', 'B', ST_GeomFromText('POINT(-4.7800 37.8890)', 4326), 1, 'residencial', 6, NOW(), NOW()),
(8, 'Calle Caballerizas 2', 'Bajo', 'Rest.', ST_GeomFromText('POINT(-4.7820 37.8780)', 4326), 2, 'comercial', 7, NOW(), NOW()),
(9, 'Calle Lineros 14', '2', '1', ST_GeomFromText('POINT(-4.7760 37.8830)', 4326), 4, 'residencial', 10, NOW(), NOW()),
(10, 'Calle Postrera 5', '1', 'A', ST_GeomFromText('POINT(-4.7860 37.8740)', 4326), 3, 'residencial', 8, NOW(), NOW()),
(11, 'Av. Aeropuerto 1', 'Bajo', 'Ofi 1', ST_GeomFromText('POINT(-4.7900 37.8800)', 4326), 5, 'comercial', 9, NOW(), NOW()),
(12, 'Calle Gondomar 1', '3', 'C', ST_GeomFromText('POINT(-4.7780 37.8880)', 4326), 1, 'residencial', NULL, NOW(), NOW());

-- 5. QUINTO: VISITAS (Nuevas IDs 5 a 10)
-- Ahora sí, los id_usuario (5, 6, 7, 8) ya existen arriba.
INSERT INTO visitas (id, id_usuario, id_cliente, fecha_hora, id_estado, observaciones, created_at, updated_at) VALUES 
(5, 5, 5, NOW() - INTERVAL '1 day', 9, 'Presupuesto entregado en mano.', NOW(), NOW()),
(6, 6, 9, NOW(), 3, 'Reunión de captación comercial.', NOW(), NOW()),
(7, 7, 10, NOW() + INTERVAL '2 days', 1, 'Cita confirmada.', NOW(), NOW()),
(8, 8, 7, NOW() - INTERVAL '4 hours', 8, 'Local cerrado al llegar.', NOW(), NOW()),
(9, 5, 6, NOW() + INTERVAL '1 day', 1, 'Visita rutinaria.', NOW(), NOW()),
(10, 1, 8, NOW() - INTERVAL '3 days', 4, 'Venta cerrada por admin.', NOW(), NOW());
```
