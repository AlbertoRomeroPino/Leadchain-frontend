import { LucideUserRoundCog, UserRoundX } from "lucide-react";
import "../../../styles/components/Clientes/Info/InfoClienteToolbar.css";

interface InfoClienteToolbarProps {
  canManageCliente: boolean;
  canGoBack: boolean;
  deletingCliente: boolean;
  onBack?: () => void;
  onEditClick: () => void;
  onDeleteClick: () => void;
}

const InfoClienteToolbar = ({
  canManageCliente,
  canGoBack,
  deletingCliente,
  onBack,
  onEditClick,
  onDeleteClick,
}: InfoClienteToolbarProps) => {
  if (!canGoBack && !canManageCliente) {
    return null;
  }

  return (
    <section className="info-cliente-toolbar">
      {canGoBack && onBack && (
        <button
          type="button"
          className="info-cliente-back-button"
          onClick={onBack}
        >
          ← Volver
        </button>
      )}

      {canManageCliente && (
        <>
          <button
            type="button"
            className="cliente-action-button cliente-action-button--edit"
            onClick={onEditClick}
          >
            <LucideUserRoundCog /> Actualizar
          </button>
          <button
            type="button"
            className="cliente-action-button cliente-action-button--delete"
            onClick={onDeleteClick}
            disabled={deletingCliente}
          >
            <UserRoundX /> Borrar
          </button>
        </>
      )}
    </section>
  );
};

export default InfoClienteToolbar;
