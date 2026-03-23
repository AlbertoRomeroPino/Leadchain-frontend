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
