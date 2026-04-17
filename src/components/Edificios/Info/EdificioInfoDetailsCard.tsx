import type { Edificio } from '../../../types/edificios/Edificio'

import '../../../styles/components/Edificios/Info/EdificioInfoDetailsCard.css';

interface EdificioInfoDetailsCardProps {
  edificio: Edificio
  zona?: { nombre?: string } | null
}

const EdificioInfoDetailsCard = ({
  edificio,
  zona
}: EdificioInfoDetailsCardProps) => {
  return (
    <div className="edificio-card edificio-details-card">
      <h2 className="edificio-details-title">Datos del edificio</h2>
      <p className="edificio-details-row">
        <strong className="edificio-details-label">Dirección:</strong> {edificio.direccion_completa}
      </p>
      <p className="edificio-details-row">
        <strong className="edificio-details-label">Tipo:</strong> {edificio.tipo}
      </p>
      <p className="edificio-details-row">
        <strong className="edificio-details-label">Zona:</strong> {zona?.nombre ?? edificio.id_zona}
      </p>
      <p className="edificio-details-row">
        <strong className="edificio-details-label">Lat:</strong> {edificio.ubicacion?.lat ?? '-'}
      </p>
      <p className="edificio-details-row">
        <strong className="edificio-details-label">Lng:</strong> {edificio.ubicacion?.lng ?? '-'}
      </p>
    </div>
  )
}

export default EdificioInfoDetailsCard