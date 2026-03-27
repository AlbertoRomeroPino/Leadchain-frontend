import Sidebar from "../layout/Sidebar";


const InicioPage = () => {
  return (
    <>
      <Sidebar />

      {/* Implementar aqui ejemplos de statusAlert con botones*/}
      {/* Implementar barras circulares de progreso con datos de visitas, clientes, numero de visitas
      compradas, denegadas */}
      <main style={{ marginLeft: "80px", padding: "20px" }}>
        <h1>Bienvenido a Leadchain</h1>
        <p>Selecciona una sección del menú para comenzar a gestionar tus clientes y visitas.</p>
      </main>
    </>
  );
}

export default InicioPage;
