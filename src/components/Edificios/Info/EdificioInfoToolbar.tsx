import { LucideUserRoundCog, UserRoundX } from 'lucide-react';

interface EditorToolbarProps {
  canManageEdificio: boolean;
  canGoBack: boolean;
  deletingEdificio: boolean;
  onBack?: () => void;
  onEditClick: () => void;
  onDeleteClick: () => void;
}

const EdificioInfoToolbar = ({
  canManageEdificio,
  canGoBack,
  deletingEdificio,
  onBack,
  onEditClick,
  onDeleteClick,
}: EditorToolbarProps) => {
  return (
    <section className="info-edificio-toolbar">
      {canGoBack && onBack && (
        <button
          type="button"
          className="info-edificio-back-button"
          onClick={onBack}
        >
          ← Volver
        </button>
      )}
      {canManageEdificio && (
        <div className="buttons-section">
          <button
            type="button"
            className="edificio-action-button edificio-action-button--edit"
            onClick={onEditClick}
          >
            <LucideUserRoundCog /> Actualizar
          </button>
          <button
            type="button"
            className="edificio-action-button edificio-action-button--delete"
            onClick={onDeleteClick}
            disabled={deletingEdificio}
          >
            <UserRoundX /> Borrar
          </button>
        </div>
      )}
    </section>
  )
}

export default EdificioInfoToolbar