import { HousePlus } from "lucide-react";
import "../../styles/components/Edificios/EdificioHeader.css";

interface EdificioHeaderProps {
  canCreateEdificio: boolean;
  onCreateClick: () => void;
}

const EdificioHeader = ({
  canCreateEdificio,
  onCreateClick,
}: EdificioHeaderProps) => {
  return (
    <div className="edificio-header">
      <h2 className="edificio-header-title">Edificios</h2>
      {canCreateEdificio && (
        <button className="edificio-header-button" onClick={onCreateClick}>
          <HousePlus size={16} />
          Crear Edificio
        </button>
      )}
    </div>
  );
};

export default EdificioHeader;
