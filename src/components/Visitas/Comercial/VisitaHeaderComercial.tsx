import "../../../styles/components/Visitas/VisitasHeader.css";

type VisitasHeaderComercialProps = {
  search: string;
  statusFilter: string;
  statusOptions: string[];
  onSearchChange: (value: string) => void;
  onStatusChange: (value: string) => void;
};

/**
 * Componente VisitasHeaderComercial refactorizado con bloque de retorno explícito.
 */
const VisitasHeaderComercial = ({
  search,
  statusFilter,
  statusOptions,
  onSearchChange,
  onStatusChange,
}: VisitasHeaderComercialProps) => {
  // Aquí podrías añadir lógica adicional en el futuro (hooks, variables calculadas, etc.)

  return (
    <div className="visitas-page-header">
      <div>
        <h1>Visitas</h1>
        <div className="visitas-actions">
          {/* Espacio reservado para acciones adicionales como botones de exportar */}
        </div>
      </div>

      <div>
        <div className="visitas-search-row">
          <div className="visitas-search-wrapper">
            <label htmlFor="search-user" className="visitas-search-label">
              Buscar por cliente
            </label>
            <input
              id="search-user"
              type="search"
              value={search}
              onChange={(event) => onSearchChange(event.target.value)}
              className="visitas-search-input"
              placeholder={
                  "Nombre/Apellido cliente"
              }
            />
          </div>
          
          <div className="visitas-status-wrapper">
            <label htmlFor="status-filter" className="visitas-search-label">
              Filtrar por estado
            </label>
            <select
              id="status-filter"
              value={statusFilter}
              onChange={(event) => onStatusChange(event.target.value)}
              className="visitas-search-input"
            >
              <option value="all">Todos los estados</option>
              {statusOptions.map((status) => (
                <option key={status} value={status.toLowerCase()}>
                  {status}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VisitasHeaderComercial;