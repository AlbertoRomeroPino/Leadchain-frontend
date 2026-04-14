import { MapPlus } from "lucide-react";

interface ZonaHeaderProps {
  onCreate: () => void;
  creatingZona: boolean;
}

const ZonaHeader = ({ onCreate, creatingZona }: ZonaHeaderProps) => (
  <div className="zona-header">
    <div>
      <h1 className="clientes-title">Zonas</h1>
    </div>
    <button className="zona-create-button" onClick={onCreate} disabled={creatingZona}>
      <MapPlus size={16} />
      Crear
    </button>
  </div>
);

export default ZonaHeader;
