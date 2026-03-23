import "./App.css";
import Header from "./layout/header";
import showStatusAlert from "./components/StatusAlert";

function App() {  

  return (
    <>
      
      <Header />

      {/* Implementar aqui ejemplos de statusAlert con botones*/}
        <button onClick={() => showStatusAlert({ title: "¡Éxito!", description: "La operación se completó correctamente.", type: "success" })}>
          Mostrar Alerta de Éxito
        </button>
        <button onClick={() => showStatusAlert({ title: "Error", description: "Ocurrió un error al procesar tu solicitud.", type: "error" })}>
          Mostrar Alerta de Error
        </button>
        <button onClick={() => showStatusAlert({ title: "Advertencia", description: "Ten cuidado con esta acción.", type: "warning" })}>
          Mostrar Alerta de Advertencia
        </button>
        <button onClick={() => showStatusAlert({ title: "Información", description: "Aquí tienes algunos detalles adicionales.", type: "info" })}>
          Mostrar Alerta de Información
        </button>
        <button onClick={() => showStatusAlert({ title: "Cargando...", description: "Por favor espera mientras se procesa tu solicitud.", type: "loading" })}>
          Mostrar Alerta de Carga
        </button>
        <button onClick={() => showStatusAlert({ title: "Acción Requerida", description: "¿Deseas continuar con esta acción?", type: "action" })}>
          Mostrar Alerta de Acción
        </button>
      
    </>
  );
}

export default App;
