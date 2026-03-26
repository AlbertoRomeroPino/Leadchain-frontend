import { HousePlus } from "lucide-react";

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
      <h2>Edificios</h2>
      {canCreateEdificio && (
        <button onClick={onCreateClick}>
          <HousePlus size={16} />
          Crear Edificio
          </button>
      )}
    </div>
  );
};

export default EdificioHeader;
