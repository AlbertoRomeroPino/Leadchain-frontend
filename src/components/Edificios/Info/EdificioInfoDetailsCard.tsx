import type { Edificio } from '../../../types/edificios/Edificio'

interface EdificioInfoDetailsCardProps {
  edificio: Edificio
  zona?: { nombre_zona?: string } | null
}

const EdificioInfoDetailsCard = ({
  edificio,
  zona
}: EdificioInfoDetailsCardProps) => {
  return (
    <div className="edificio-card">
      <h2>Datos del edificio</h2>
      <p>
        <strong>Dirección:</strong> {edificio.direccion_completa}
      </p>
      <p>
        <strong>Tipo:</strong> {edificio.tipo}
      </p>
      <p>
        <strong>Zona:</strong> {zona?.nombre_zona ?? edificio.id_zona}
      </p>
      <p>
        <strong>Lat:</strong> {edificio.ubicacion?.lat ?? '-'}
      </p>
      <p>
        <strong>Lng:</strong> {edificio.ubicacion?.lng ?? '-'}
      </p>

      <h3>Clientes en el bloque</h3>
    </div>
  )
}

export default EdificioInfoDetailsCard