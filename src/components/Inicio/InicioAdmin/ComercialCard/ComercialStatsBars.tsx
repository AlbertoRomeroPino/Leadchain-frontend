interface ComercialStatsBarsProps {
  exitosos: number;
  rechazados: number;
  enProceso: number;
  totalVisitas: number;
}

const ComercialStatsBars: React.FC<ComercialStatsBarsProps> = ({
  exitosos,
  rechazados,
  enProceso,
  totalVisitas,
}) => {
  const categories = [
    {
      nombre: "Exitoso",
      cantidad: exitosos,
      color: "#10b981",
      porcentaje: totalVisitas > 0 ? Math.round((exitosos / totalVisitas) * 100) : 0,
    },
    {
      nombre: "En Proceso",
      cantidad: enProceso,
      color: "#f59e0b",
      porcentaje: totalVisitas > 0 ? Math.round((enProceso / totalVisitas) * 100) : 0,
    },
    {
      nombre: "Rechazado",
      cantidad: rechazados,
      color: "#ef4444",
      porcentaje: totalVisitas > 0 ? Math.round((rechazados / totalVisitas) * 100) : 0,
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
