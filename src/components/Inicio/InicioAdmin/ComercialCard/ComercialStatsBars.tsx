import "../../../../styles/components/Inicio/InicioAdmin/ComercialCard/ComercialStatsBars.css";

interface ComercialStatsBarsProps {
  exitosos: number;
  rechazados: number;
  enProceso: number;
  totalVisitas: number;
  totalClientes: number;
}

const ComercialStatsBars: React.FC<ComercialStatsBarsProps> = ({
  exitosos,
  rechazados,
  enProceso,
  totalVisitas,
  totalClientes,
}) => {
  // Calcular clientes sin visita
  const sinVisita = totalClientes - totalVisitas;

  // Función para distribuir porcentajes correctamente (siempre suma 100%)
  const distribuirPorcentajes = (
    values: number[],
    total: number
  ): number[] => {
    if (total === 0) return values.map(() => 0);

    // Calcular porcentajes sin redondear
    const porcentajesSinRedondear = values.map((visita) => (visita / total) * 100);

    // Calcular partes enteras y decimales
    const enteros = porcentajesSinRedondear.map((p) => Math.floor(p));
    const decimales = porcentajesSinRedondear.map((p, i) => p - enteros[i]);

    // Sumar los enteros
    const sumaEnteros = enteros.reduce((a, b) => a + b, 0);
    const diferencia = 100 - sumaEnteros;

    // Distribuir los puntos faltantes a los que tienen mayor decimal
    const indices = Array.from({ length: values.length }, (_, i) => i);
    indices.sort((a, b) => decimales[b] - decimales[a]);

    for (let i = 0; i < diferencia; i++) {
      enteros[indices[i]]++;
    }

    return enteros;
  };

  const porcentajes = distribuirPorcentajes(
    [exitosos, enProceso, rechazados, sinVisita],
    totalClientes
  );

  const categories = [
    {
      nombre: "Exitoso",
      cantidad: exitosos,
      color: "#10b981",
      porcentaje: porcentajes[0],
    },
    {
      nombre: "En Proceso",
      cantidad: enProceso,
      color: "#f59e0b",
      porcentaje: porcentajes[1],
    },
    {
      nombre: "Rechazado",
      cantidad: rechazados,
      color: "#ef4444",
      porcentaje: porcentajes[2],
    },
    {
      nombre: "Sin visita",
      cantidad: sinVisita,
      color: "#6b7280",
      porcentaje: porcentajes[3],
    },
  ];

  return (
    <div className="comercial-stats-bars">
      {categories.map((category) => (
        <div key={category.nombre} className="stats-bar-item">
          <div className="stats-bar-header">
            <span className="stats-bar-label">{category.nombre}</span>
            <span className="stats-bar-count">
              {category.cantidad} ({category.porcentaje}%)
            </span>
          </div>
          <div className="stats-bar-container">
            <div
              className="stats-bar-fill"
              style={{
                width: `${category.porcentaje}%`,
                backgroundColor: category.color,
              }}
            />
          </div>
        </div>
      ))}
    </div>
  );
};

export default ComercialStatsBars;
