import { useState } from 'react';
import { Trash2 } from 'lucide-react';
import type { Cliente } from '../../../types/clientes/Cliente'
import { EdificiosService } from '../../../services/EdificiosService'

interface ClienteInfo {
  cliente: Cliente
  planta: string | null
  puerta: string | null
}

import '../../../styles/components/Edificios/Info/EdificioInfoClienteCard.css';

interface EdificioInfoClienteCardProps {
  edificioId: number
  clientes: ClienteInfo[]
  onClienteRemoved?: (clienteId: number) => void
  canManage?: boolean
}

const EdificioInfoClienteCard = ({ 
  edificioId, 
  clientes, 
  onClienteRemoved,
  canManage = false
}: EdificioInfoClienteCardProps) => {
  const [removingClienteId, setRemovingClienteId] = useState<number | null>(null);

  const handleRemoveCliente = async (clienteId: number) => {
    if (!confirm('¿Estás seguro de que deseas quitar este cliente del edificio?')) {
      return;
    }

    setRemovingClienteId(clienteId);
    try {
      await EdificiosService.detachCliente(edificioId, clienteId);
      onClienteRemoved?.(clienteId);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al quitar cliente';
      alert(message);
    } finally {
      setRemovingClienteId(null);
    }
  };

  return (
    <div className="edificio-card edificio-clientes-card">
      <h2 className="edificio-clientes-title">Clientes</h2>
      <ul className="edificio-clientes-list">
        {clientes.length === 0 ? (
          <li className="edificio-cliente-item">No hay clientes.</li>
        ) : (
          clientes.map(({ cliente, planta, puerta }) => (
            <li key={`cliente-${cliente.id}`} className="edificio-cliente-item">
              <div className="cliente-info-wrapper">
                <div className="cliente-detail">
                  <div className="cliente-nombre">
                    {cliente.nombre} {cliente.apellidos}
                  </div>
                  <div className="cliente-meta">Piso: {planta ?? '-'} • Puerta: {puerta ?? '-'}</div>
                  <div className="cliente-contacto">
                    <div>Tel: {cliente.telefono ?? 'N/A'}</div>
                    <div>Email: {cliente.email ?? 'N/A'}</div>
                  </div>
                </div>
                {canManage && (
                  <button
                    onClick={() => handleRemoveCliente(cliente.id)}
                    disabled={removingClienteId === cliente.id}
                    className="cliente-remove-btn"
                    title="Quitar cliente del edificio"
                  >
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
            </li>
          ))
        )}
      </ul>
    </div>
  )
}

export default EdificioInfoClienteCard