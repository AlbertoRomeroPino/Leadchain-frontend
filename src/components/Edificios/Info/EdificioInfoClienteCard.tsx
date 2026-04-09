import type { Cliente } from '../../../types/clientes/Cliente'

interface ClienteInfo {
  cliente: Cliente
  planta: string | null
  puerta: string | null
}

interface EdificioInfoClienteCardProps {
  clientes: ClienteInfo[]
}

const EdificioInfoClienteCard = ({ clientes }: EdificioInfoClienteCardProps) => {
  return (
    <div className="edificio-card edificio-clientes-card">
      <h2 className="edificio-clientes-title">Clientes</h2>
      <ul className="edificio-clientes-list">
        {clientes.length === 0 ? (
          <li className="edificio-cliente-item">No hay clientes.</li>
        ) : (
          clientes.map(({ cliente, planta, puerta }) => (
            <li key={`cliente-${cliente.id}`} className="edificio-cliente-item">
              <div className="cliente-nombre">
                {cliente.nombre} {cliente.apellidos}
              </div>
              <div className="cliente-meta">Piso: {planta ?? '-'} • Puerta: {puerta ?? '-'}</div>
              <div className="cliente-contacto">Tel: {cliente.telefono ?? 'N/A'} • Email: {cliente.email ?? 'N/A'}</div>
            </li>
          ))
        )}
      </ul>
    </div>
  )
}

export default EdificioInfoClienteCard