interface EdificioInfoClienteCardProps {
  clientes: string[]
}

const EdificioInfoClienteCard = ({ clientes }: EdificioInfoClienteCardProps) => {
  return (
    <div className="edificio-card">
      <h2>Clientes</h2>
      <ul>
        {clientes.length === 0 ? (
          <li>No hay clientes.</li>
        ) : (
          clientes.map((cliente) => <li key={cliente}>{cliente}</li>)
        )}
      </ul>
    </div>
  )
}

export default EdificioInfoClienteCard