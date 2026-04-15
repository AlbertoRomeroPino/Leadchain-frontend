import "../../../../styles/components/Inicio/InicioComercial/ClientesSinVisitar/ClientesStats.css";

interface ClientesStatsProps {
  totalClientes: number;
  conVisita: number;
  sinVisita: number;
}

const ClientesStats = ({
  totalClientes,
  conVisita,
  sinVisita,
}: ClientesStatsProps) => {
  const cobertura =
    totalClientes > 0 ? Math.round((conVisita / totalClientes) * 100) : 0;

  return (
    <div className="dashboard-stats">
      <div className="clientes-stat">
        <span className="stat-label">Total Clientes</span>
        <span className="stat-value">{totalClientes}</span>
      </div>
      <div className="clientes-stat">
        <span className="stat-label">Con Visita</span>
        <span className="stat-value stat-green">{conVisita}</span>
      </div>
      <div className="clientes-stat">
        <span className="stat-label">Sin Visita</span>
        <span className="stat-value stat-red">{sinVisita}</span>
      </div>
      <div className="clientes-stat">
        <span className="stat-label">Cobertura</span>
        <span className="stat-value">{cobertura}%</span>
      </div>
    </div>
  );
};

export default ClientesStats;
