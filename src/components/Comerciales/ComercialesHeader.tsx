import type { UserVisitas } from '../../types/users/User';
import { Trash, UserPlus2, UserRoundCog } from 'lucide-react';
import '../../styles/components/Comerciales/ComercialesHeader.css';

interface ComercialesHeaderProps {
  selectedComercialIds: Set<number>;
  comerciales: UserVisitas[];
  setComercialAEditar: (comercial: UserVisitas | null) => void;
  setShowCreateForm: (show: boolean) => void;
  handleDeleteComerciales: () => void;
  isLoading: boolean;
}

const ComercialesHeader = ({
  selectedComercialIds,
  comerciales,
  setComercialAEditar,
  setShowCreateForm,
  handleDeleteComerciales,
  isLoading,
}: ComercialesHeaderProps) => {
  return (
    <section className="Header">
      <div className="comerciales-header">
        <h1 className="comerciales-title">Comerciales a mi cargo</h1>
        <div className="comerciales-button-group">
          {selectedComercialIds.size === 1 ? (
            <button
              className="comerciales-create-button"
              onClick={() => {
                const comercialId = Array.from(selectedComercialIds)[0];
                const comercial = comerciales.find((c) => c.id === comercialId);
                if (comercial) {
                  setComercialAEditar(comercial);
                  setShowCreateForm(true);
                }
              }}
            >
              <UserRoundCog size={16} />
              Editar Usuario
            </button>
          ) : (
            <button
              className="comerciales-create-button"
              onClick={() => {
                setComercialAEditar(null);
                setShowCreateForm(true);
              }}
            >
              <UserPlus2 size={16} />
              Crear Comercial
            </button>
          )}
          <button
            className="comerciales-delete-button"
            onClick={handleDeleteComerciales}
            disabled={selectedComercialIds.size === 0 || isLoading}
          >
            <Trash size={16} />
            Eliminar {selectedComercialIds.size > 0 && `(${selectedComercialIds.size})`}
          </button>
        </div>
      </div>
    </section>
  );
}

export default ComercialesHeader;
